type Vector = { set(x: number, y?: number): void };
type PetModel = {
	width: number;
	height: number;
	anchor: Vector;
	scale: Vector;
	position: Vector;
	automator: { autoUpdate: boolean };
	destroy(): void;
	internalModel: {
		originalWidth: number;
		originalHeight: number;
		focusController: { focus(x: number, y: number): void };
		motionManager: { stopAllMotions(): void };
	};
	motion(
		group: string,
		index: number,
		priority: number,
		options?: { loop: boolean },
	): Promise<unknown>;
};
type PetApp = {
	canvas: HTMLCanvasElement;
	stage: { addChild(model: PetModel): void };
	ticker: { maxFPS: number };
	init(options: Record<string, unknown>): Promise<void>;
	start(): void;
	stop(): void;
	destroy(
		options: { removeView: boolean },
		stageOptions: { children: boolean },
	): void;
};
type Vendor = {
	Application: new () => PetApp;
	Live2DModel: {
		from(url: string, options: Record<string, unknown>): Promise<PetModel>;
	};
	extensions: { add(plugin: unknown): void };
	Live2DPlugin: unknown;
	configureCubismSDK(options: { memorySizeMB: number }): void;
};
const globals = window as unknown as {
	Live2DCubismCore?: unknown;
	__dshLive2dPetVendor?: Vendor;
};

const scriptLoads = new Map<string, Promise<void>>();
function loadScript(src: string): Promise<void> {
	const existing = scriptLoads.get(src);
	if (existing) return existing;
	const promise = new Promise<void>((resolve, reject) => {
		const script = document.createElement("script");
		script.src = src;
		script.async = true;
		script.onload = () => resolve();
		script.onerror = () => {
			script.remove();
			scriptLoads.delete(src);
			reject(new Error("看板娘运行时加载失败"));
		};
		document.head.append(script);
	});
	scriptLoads.set(src, promise);
	return promise;
}

function storedState(): { collapsed?: boolean; x?: number; y?: number } {
	try {
		return JSON.parse(localStorage.getItem("deepseek-mascot") || "{}");
	} catch {
		return {};
	}
}

export function registerDeepSeekMascot() {
	if (customElements.get("deepseek-mascot")) return;
	customElements.define(
		"deepseek-mascot",
		class extends HTMLElement {
			private app?: PetApp;
			private model?: PetModel;
			private loading = false;
			private collapsed = false;
			private events = new AbortController();
			private timer = 0;
			private reactionTimer = 0;
			private bootTimer = 0;
			private moved = false;
			private mounted = false;
			private mountVersion = 0;

			connectedCallback() {
				// Scrollbar/layout code can move this same element within the document.
				if (this.mounted) return;
				this.mounted = true;
				this.mountVersion += 1;
				this.events = new AbortController();
				const saved = storedState();
				this.collapsed =
					typeof saved?.collapsed === "boolean"
						? saved.collapsed
						: matchMedia("(max-width: 767px)").matches;
				const signal = this.events.signal;
				this.querySelector(".mascot-hide")!.addEventListener(
					"click",
					() => this.toggle(true),
					{ signal },
				);
				this.querySelector(".mascot-restore")!.addEventListener(
					"click",
					() => this.toggle(false),
					{ signal },
				);
				this.querySelector(".mascot-pat")!.addEventListener(
					"click",
					() => {
						if (this.dataset.state === "error") {
							void this.boot();
							return;
						}
						void this.react();
					},
					{ signal },
				);
				document.addEventListener(
					"pointermove",
					(event) => {
						if (
							!this.model ||
							this.collapsed ||
							matchMedia("(prefers-reduced-motion: reduce)").matches
						)
							return;
						const rect =
							this.querySelector(".mascot-stage")!.getBoundingClientRect();
						const x = Math.max(
							-1,
							Math.min(
								1,
								(event.clientX - rect.left - rect.width / 2) / (innerWidth / 2),
							),
						);
						const y = Math.max(
							-1,
							Math.min(
								1,
								(event.clientY - rect.top - rect.height / 2) /
									(innerHeight / 2),
							),
						);
						this.model.internalModel.focusController.focus(x, -y);
					},
					{ signal, passive: true },
				);
				document.addEventListener(
					"visibilitychange",
					() => this.syncPlayback(),
					{ signal },
				);
				window.addEventListener("resize", () => this.clampPosition(), {
					signal,
				});
				const handle = this.querySelector<HTMLButtonElement>(".mascot-drag")!;
				const stage = this.querySelector<HTMLElement>(".mascot-stage")!;
				let drag:
					| { x: number; y: number; left: number; top: number }
					| undefined;
				let dragged = false;
				for (const surface of [handle, stage]) {
					surface.addEventListener(
						"pointerdown",
						(event) => {
							if (event.button !== 0) return;
							const rect = this.getBoundingClientRect();
							drag = {
								x: event.clientX,
								y: event.clientY,
								left: rect.left,
								top: rect.top,
							};
							dragged = false;
							surface.setPointerCapture(event.pointerId);
						},
						{ signal },
					);
					surface.addEventListener(
						"pointermove",
						(event) => {
							if (!drag) return;
							const dx = event.clientX - drag.x;
							const dy = event.clientY - drag.y;
							// A small hand movement is still a tap, including on touchscreens.
							if (!dragged && Math.hypot(dx, dy) < 5) return;
							dragged = true;
							this.style.left = `${drag.left + dx}px`;
							this.style.top = `${drag.top + dy}px`;
							this.style.bottom = "auto";
							this.moved = true;
							this.clampPosition();
						},
						{ signal },
					);
					surface.addEventListener(
						"pointerup",
						() => {
							drag = undefined;
							if (dragged) this.save();
						},
						{ signal },
					);
					surface.addEventListener(
						"pointercancel",
						() => {
							drag = undefined;
							dragged = true;
							this.save();
						},
						{ signal },
					);
				}
				stage.addEventListener(
					"click",
					() => {
						if (!dragged) void this.react();
					},
					{ signal },
				);
				stage.addEventListener(
					"keydown",
					(event) => {
						if (event.key !== "Enter" && event.key !== " ") return;
						event.preventDefault();
						void this.react();
					},
					{ signal },
				);
				if (Number.isFinite(saved?.x) && Number.isFinite(saved?.y)) {
					this.style.left = `${saved.x}px`;
					this.style.top = `${saved.y}px`;
					this.style.bottom = "auto";
					this.moved = true;
				}
				this.render();
				this.clampPosition();
				// Defer the optional renderer until the initial page has painted.
				if (!this.collapsed)
					this.bootTimer = window.setTimeout(() => {
						void this.boot();
					}, 1200);
			}

			disconnectedCallback() {
				// A DOM move fires disconnected/connected synchronously. Only dispose
				// after a microtask confirms that the element really left the page.
				queueMicrotask(() => {
					if (this.isConnected) return;
					this.mounted = false;
					this.mountVersion += 1;
					this.events.abort();
					clearTimeout(this.timer);
					clearTimeout(this.reactionTimer);
					clearTimeout(this.bootTimer);
					if (this.model) this.model.automator.autoUpdate = false;
					this.app?.destroy({ removeView: true }, { children: true });
					this.app = undefined;
					this.model = undefined;
					this.loading = false;
				});
			}

			private save() {
				const rect = this.getBoundingClientRect();
				try {
					localStorage.setItem(
						"deepseek-mascot",
						JSON.stringify({
							collapsed: this.collapsed,
							...(this.moved ? { x: rect.left, y: rect.top } : {}),
						}),
					);
				} catch {
					/* The widget still works when browser storage is unavailable. */
				}
			}

			private render() {
				this.dataset.collapsed = String(this.collapsed);
				this.querySelector<HTMLElement>(".mascot-body")!.hidden =
					this.collapsed;
				this.querySelector<HTMLButtonElement>(".mascot-restore")!.hidden =
					!this.collapsed;
			}

			private toggle(collapsed: boolean) {
				this.collapsed = collapsed;
				this.render();
				this.clampPosition();
				this.save();
				this.syncPlayback();
				if (!collapsed && !this.model) void this.boot();
				this.querySelector<HTMLButtonElement>(
					collapsed ? ".mascot-restore" : ".mascot-hide",
				)!.focus();
			}

			private clampPosition() {
				if (!this.moved) return;
				const rect = this.getBoundingClientRect();
				this.style.left = `${Math.max(0, Math.min(innerWidth - rect.width, rect.left))}px`;
				this.style.top = `${Math.max(0, Math.min(innerHeight - rect.height, rect.top))}px`;
			}

			private say(message: string, duration = 4000) {
				const bubble = this.querySelector<HTMLElement>(".mascot-message")!;
				bubble.textContent = message;
				clearTimeout(this.timer);
				if (duration)
					this.timer = window.setTimeout(() => {
						bubble.textContent = "";
					}, duration);
			}

			private syncPlayback() {
				if (!this.app) return;
				if (this.model)
					this.model.automator.autoUpdate = !this.collapsed && !document.hidden;
				if (this.collapsed || document.hidden) this.app.stop();
				else this.app.start();
			}

			private async boot() {
				if (this.loading || this.model || this.collapsed) return;
				const version = this.mountVersion;
				const isCurrentMount = () =>
					this.isConnected && this.mountVersion === version;
				this.loading = true;
				this.dataset.state = "loading";
				this.say("一只小鲸鱼正在游过来…", 0);
				try {
					if (!globals.Live2DCubismCore) await loadScript(this.dataset.core!);
					if (!globals.__dshLive2dPetVendor)
						await loadScript(this.dataset.vendor!);
					if (!isCurrentMount()) return;
					const vendor = globals.__dshLive2dPetVendor!;
					vendor.extensions.add(vendor.Live2DPlugin);
					vendor.configureCubismSDK({ memorySizeMB: 64 });
					const stage = this.querySelector<HTMLElement>(".mascot-stage")!;
					const app = new vendor.Application();
					await app.init({
						width: 220,
						height: 260,
						backgroundAlpha: 0,
						antialias: true,
						resolution: Math.min(devicePixelRatio || 1, 2),
						preference: "webgl",
					});
					if (!isCurrentMount()) {
						app.destroy({ removeView: true }, { children: true });
						return;
					}
					this.app = app;
					app.ticker.maxFPS = 30;
					stage.append(app.canvas);
					app.canvas.setAttribute("aria-hidden", "true");
					const model = await vendor.Live2DModel.from(
						new URL(this.dataset.model!, location.href).href,
						{
							autoUpdate: false,
							autoFocus: false,
							autoHitTest: false,
							textureOptions: { lod: "full" },
						},
					);
					if (!isCurrentMount()) {
						model.destroy();
						return;
					}
					this.model = model;
					model.anchor.set(0.5, 0.5);
					const scale =
						Math.min(
							220 / model.internalModel.originalWidth,
							260 / model.internalModel.originalHeight,
						) * 0.96;
					model.scale.set(scale);
					model.position.set(110, 130);
					app.stage.addChild(model);
					model.automator.autoUpdate = true;
					await model.motion("Idle", 0, 3, { loop: true });
					this.dataset.state = "ready";
					const button = this.querySelector<HTMLButtonElement>(".mascot-pat")!;
					button.textContent = "摸摸";
					button.setAttribute("aria-label", "摸摸 DeepSeek 看板娘");
					this.say("你好呀～点点我，或按住拖动。");
					this.syncPlayback();
				} catch (error) {
					if (this.mountVersion !== version) return;
					this.app?.destroy({ removeView: true }, { children: true });
					this.app = undefined;
					this.model = undefined;
					this.dataset.state = "error";
					this.say("小鲸鱼暂时没游过来，点「重试」再试一次。", 0);
					const button = this.querySelector<HTMLButtonElement>(".mascot-pat")!;
					button.textContent = "重试";
					button.setAttribute("aria-label", "重新加载 DeepSeek 看板娘");
					console.warn("DeepSeek 看板娘加载失败：", error);
				} finally {
					if (this.mountVersion === version) this.loading = false;
				}
			}

			private async react() {
				if (!this.model) return;
				this.say("收到摸摸！充电完毕，继续加油～");
				clearTimeout(this.reactionTimer);
				this.model.internalModel.motionManager.stopAllMotions();
				await this.model.motion("Hammer", 0, 3, { loop: false });
				this.reactionTimer = window.setTimeout(() => {
					this.model?.internalModel.motionManager.stopAllMotions();
					void this.model?.motion("Idle", 0, 3, { loop: true });
				}, 3500);
			}
		},
	);
}
