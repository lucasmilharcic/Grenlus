import {
    useEffect,
    useRef,
    useState
} from "react";

import * as THREE from "three";

import {
    MARGEN_TAZA_PORCENTAJE
} from "../utils/personalizacion3d";

import "./Producto3DPreview.css";

const COLORES_PRODUCTO = {
    blanco: "#f5f4ef",
    negra: "#22252a",
    negro: "#22252a",
    azul: "#28608f",
    celeste: "#77a9cf",
    rojo: "#b83a41",
    verde: "#568168",
    rosa: "#d78b9a",
    amarillo: "#e1be56",
    gris: "#858b92",
    plateado: "#a9afb4",
    plata: "#a9afb4",
    dorado: "#b99450",
    transparente: "#e6edf1"
};

function obtenerColorProducto(color) {
    const nombre = String(color || "blanco")
        .trim()
        .toLowerCase();

    if (/^#[0-9a-f]{3,8}$/i.test(nombre)) {
        return nombre;
    }

    return COLORES_PRODUCTO[nombre] || "#f5f4ef";
}

function crearModelo(scene, tipoModelo) {
    const grupo = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.36,
        metalness: tipoModelo === "BOTELLA" ? 0.28 : 0.02
    });

    if (tipoModelo === "TAZA") {
        const cuerpo = new THREE.Mesh(
            new THREE.CylinderGeometry(0.68, 0.64, 1.42, 96, 1, true),
            material
        );
        cuerpo.position.y = -0.02;
        grupo.add(cuerpo);

        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.58, 0.58, 0.08, 64),
            material
        );
        base.position.y = -0.75;
        const materialAccesorios =
            new THREE.MeshStandardMaterial({
                color: "#f5f4ef",
                roughness: 0.36,
                metalness: 0.02
            });
        base.material = materialAccesorios;
        grupo.add(base);

        const borde = new THREE.Mesh(
            new THREE.TorusGeometry(0.675, 0.035, 12, 96),
            materialAccesorios
        );
        borde.rotation.x = Math.PI / 2;
        borde.position.y = 0.69;
        grupo.add(borde);

        const asa = new THREE.Mesh(
            new THREE.TorusGeometry(0.39, 0.085, 20, 48),
            materialAccesorios
        );
        asa.position.set(-0.77, 0.02, -0.03);
        grupo.add(asa);
        grupo.userData.colorMaterials = [materialAccesorios];

        grupo.userData.surface = cuerpo;
    } else {
        const perfil = [
            new THREE.Vector2(0.02, -1.15),
            new THREE.Vector2(0.34, -1.15),
            new THREE.Vector2(0.43, -1.08),
            new THREE.Vector2(0.45, -0.92),
            new THREE.Vector2(0.45, 0.48),
            new THREE.Vector2(0.42, 0.63),
            new THREE.Vector2(0.25, 0.82),
            new THREE.Vector2(0.21, 1.04),
            new THREE.Vector2(0.22, 1.13),
            new THREE.Vector2(0.02, 1.13)
        ];

        const cuerpo = new THREE.Mesh(
            new THREE.LatheGeometry(perfil, 96),
            material
        );
        grupo.add(cuerpo);

        const tapa = new THREE.Mesh(
            new THREE.CylinderGeometry(0.235, 0.235, 0.22, 64),
            new THREE.MeshStandardMaterial({
                color: "#343a40",
                roughness: 0.42,
                metalness: 0.12
            })
        );
        tapa.position.y = 1.22;
        grupo.add(tapa);

        grupo.userData.surface = cuerpo;
    }

    scene.add(grupo);

    return {
        grupo,
        material
    };
}

export default function Producto3DPreview({
    tipoModelo,
    color,
    designUrl,
    logo,
    onLogoChange,
    onDrop
}) {
    const containerRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const modelRef = useRef(null);
    const materialRef = useRef(null);
    const modelColorMaterialsRef = useRef([]);
    const textureCanvasRef = useRef(null);
    const textureRef = useRef(null);
    const gestureRef = useRef(null);
    const latestRef = useRef(null);

    const [imagenCargada, setImagenCargada] = useState(null);
    const [errorRender, setErrorRender] = useState("");
    const imagenDiseno =
        imagenCargada?.url === designUrl
            ? imagenCargada.image
            : null;

    useEffect(() => {
        latestRef.current = {
            logo,
            onLogoChange,
            designUrl
        };
    }, [designUrl, logo, onLogoChange]);

    useEffect(() => {
        let cancelado = false;

        if (!designUrl) {
            return undefined;
        }

        const imagen = new Image();
        imagen.onload = () => {
            if (!cancelado) {
                setImagenCargada({
                    url: designUrl,
                    image: imagen
                });
                setErrorRender("");
            }
        };
        imagen.onerror = () => {
            if (!cancelado) {
                setErrorRender(
                    "No se pudo cargar el diseño para la vista 3D."
                );
            }
        };
        imagen.src = designUrl;

        return () => {
            cancelado = true;
        };
    }, [designUrl]);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return undefined;
        }

        let renderer;

        try {
            const scene = new THREE.Scene();
            scene.background = new THREE.Color("#e8eef3");

            const camera = new THREE.PerspectiveCamera(
                34,
                1,
                0.1,
                100
            );
            camera.position.set(0, 0, 4.4);

            renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: false
            });
            renderer.setPixelRatio(
                Math.min(window.devicePixelRatio || 1, 2)
            );
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.15;
            renderer.domElement.setAttribute(
                "aria-label",
                tipoModelo === "TAZA"
                    ? "Vista 3D de la taza"
                    : "Vista 3D de la botella"
            );
            container.appendChild(renderer.domElement);

            scene.add(
                new THREE.HemisphereLight(
                    "#ffffff",
                    "#85909a",
                    2.1
                )
            );

            const luzPrincipal = new THREE.DirectionalLight(
                "#ffffff",
                3.2
            );
            luzPrincipal.position.set(-3, 4, 5);
            scene.add(luzPrincipal);

            const luzRelleno = new THREE.DirectionalLight(
                "#c2d7e6",
                1.3
            );
            luzRelleno.position.set(3, 1, -3);
            scene.add(luzRelleno);

            const { grupo, material } =
                crearModelo(scene, tipoModelo);
            grupo.rotation.y = 0.45;
            grupo.rotation.x = -0.04;

            const textureCanvas =
                document.createElement("canvas");
            textureCanvas.width = 1024;
            textureCanvas.height = 1024;

            const texture =
                new THREE.CanvasTexture(textureCanvas);
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy =
                renderer.capabilities.getMaxAnisotropy();

            material.map = texture;
            material.color.set("#ffffff");
            material.needsUpdate = true;

            rendererRef.current = renderer;
            sceneRef.current = scene;
            cameraRef.current = camera;
            modelRef.current = grupo;
            materialRef.current = material;
            modelColorMaterialsRef.current =
                grupo.userData.colorMaterials || [];
            textureCanvasRef.current = textureCanvas;
            textureRef.current = texture;

            const render = () => {
                if (
                    rendererRef.current &&
                    sceneRef.current &&
                    cameraRef.current
                ) {
                    rendererRef.current.render(
                        sceneRef.current,
                        cameraRef.current
                    );
                }
            };

            const resize = () => {
                const width = container.clientWidth;
                const height = container.clientHeight;

                if (width <= 0 || height <= 0) {
                    return;
                }

                renderer.setSize(width, height, false);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                render();
            };

            const resizeObserver =
                new ResizeObserver(resize);
            resizeObserver.observe(container);

            const raycaster = new THREE.Raycaster();
            const pointer = new THREE.Vector2();

            const obtenerInterseccion = (event) => {
                const rect =
                    renderer.domElement.getBoundingClientRect();

                pointer.x =
                    ((event.clientX - rect.left) / rect.width) * 2 - 1;
                pointer.y =
                    -((event.clientY - rect.top) / rect.height) * 2 + 1;

                raycaster.setFromCamera(pointer, camera);

                const surface = modelRef.current?.userData.surface;
                const hits = surface
                    ? raycaster.intersectObject(surface, false)
                    : [];

                return hits[0] || null;
            };

            const pointerDown = (event) => {
                if (event.button !== 0) {
                    return;
                }

                const hit = obtenerInterseccion(event);
                const current = latestRef.current;
                const currentLogo = current?.logo;

                let moverDiseno = false;

                if (
                    hit?.uv &&
                    currentLogo &&
                    current?.designUrl
                ) {
                    const x = hit.uv.x * 100;
                    const y = (1 - hit.uv.y) * 100;

                    moverDiseno =
                        x >= currentLogo.x &&
                        x <= currentLogo.x + currentLogo.width &&
                        y >= currentLogo.y &&
                        y <= currentLogo.y + currentLogo.height;
                }

                gestureRef.current = {
                    pointerId: event.pointerId,
                    mode: moverDiseno ? "design" : "orbit",
                    lastX: event.clientX,
                    lastY: event.clientY,
                    startUv: hit?.uv
                        ? {
                            x: hit.uv.x,
                            y: hit.uv.y
                        }
                        : null,
                    initialLogo: currentLogo
                        ? { ...currentLogo }
                        : null
                };

                renderer.domElement.setPointerCapture(
                    event.pointerId
                );
                event.preventDefault();
            };

            const pointerMove = (event) => {
                const gesture = gestureRef.current;

                if (
                    !gesture ||
                    gesture.pointerId !== event.pointerId
                ) {
                    return;
                }

                const current = latestRef.current;

                if (
                    gesture.mode === "design" &&
                    gesture.startUv &&
                    gesture.initialLogo
                ) {
                    const hit = obtenerInterseccion(event);

                    if (hit?.uv) {
                        let deltaU =
                            hit.uv.x - gesture.startUv.x;

                        if (deltaU > 0.5) {
                            deltaU -= 1;
                        } else if (deltaU < -0.5) {
                            deltaU += 1;
                        }

                        const deltaX = deltaU * 100;
                        const deltaY =
                            (gesture.startUv.y - hit.uv.y) * 100;
                        const maxY =
                            100 -
                            MARGEN_TAZA_PORCENTAJE -
                            gesture.initialLogo.height;

                        current?.onLogoChange({
                            ...gesture.initialLogo,
                            x: Math.min(
                                Math.max(
                                    gesture.initialLogo.x + deltaX,
                                    0
                                ),
                                100 - gesture.initialLogo.width
                            ),
                            y: Math.min(
                                Math.max(
                                    gesture.initialLogo.y + deltaY,
                                    MARGEN_TAZA_PORCENTAJE
                                ),
                                maxY
                            )
                        });
                    }
                } else if (modelRef.current) {
                    const rect =
                        renderer.domElement.getBoundingClientRect();

                    modelRef.current.rotation.y +=
                        (event.clientX - gesture.lastX) /
                        Math.max(rect.width, 1) *
                        Math.PI *
                        1.8;

                    modelRef.current.rotation.x = Math.min(
                        0.3,
                        Math.max(
                            -0.3,
                            modelRef.current.rotation.x +
                                (event.clientY - gesture.lastY) /
                                    Math.max(rect.height, 1) *
                                    Math.PI
                        )
                    );

                    renderer.render(scene, camera);
                }

                gesture.lastX = event.clientX;
                gesture.lastY = event.clientY;
            };

            const pointerUp = (event) => {
                if (
                    gestureRef.current?.pointerId ===
                    event.pointerId
                ) {
                    gestureRef.current = null;
                }
            };

            const wheel = (event) => {
                event.preventDefault();
                camera.position.z = Math.min(
                    6.5,
                    Math.max(
                        2.8,
                        camera.position.z + event.deltaY * 0.004
                    )
                );
                render();
            };

            renderer.domElement.addEventListener(
                "pointerdown",
                pointerDown
            );
            renderer.domElement.addEventListener(
                "pointermove",
                pointerMove
            );
            renderer.domElement.addEventListener(
                "pointerup",
                pointerUp
            );
            renderer.domElement.addEventListener(
                "pointercancel",
                pointerUp
            );
            renderer.domElement.addEventListener(
                "wheel",
                wheel,
                { passive: false }
            );

            resize();

            return () => {
                resizeObserver.disconnect();
                renderer.domElement.removeEventListener(
                    "pointerdown",
                    pointerDown
                );
                renderer.domElement.removeEventListener(
                    "pointermove",
                    pointerMove
                );
                renderer.domElement.removeEventListener(
                    "pointerup",
                    pointerUp
                );
                renderer.domElement.removeEventListener(
                    "pointercancel",
                    pointerUp
                );
                renderer.domElement.removeEventListener(
                    "wheel",
                    wheel
                );
                texture.dispose();
                const materials = new Set();
                grupo.traverse((objeto) => {
                    if (objeto.geometry) {
                        objeto.geometry.dispose();
                    }
                    if (objeto.material) {
                        const objectMaterials = Array.isArray(objeto.material)
                            ? objeto.material
                            : [objeto.material];
                        objectMaterials.forEach((objectMaterial) =>
                            materials.add(objectMaterial)
                        );
                    }
                });
                materials.forEach((objectMaterial) =>
                    objectMaterial.dispose()
                );
                renderer.dispose();
                renderer.domElement.remove();
                rendererRef.current = null;
                sceneRef.current = null;
                cameraRef.current = null;
                modelRef.current = null;
                materialRef.current = null;
                modelColorMaterialsRef.current = [];
                textureCanvasRef.current = null;
                textureRef.current = null;
            };
        } catch (error) {
            console.error(error);
            queueMicrotask(() =>
                setErrorRender(
                    "No se pudo iniciar la vista 3D en este navegador."
                )
            );
            renderer?.dispose();
            return undefined;
        }
    }, [tipoModelo]);

    useEffect(() => {
        const canvas = textureCanvasRef.current;
        const texture = textureRef.current;
        const material = materialRef.current;
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;

        if (!canvas || !texture || !material) {
            return;
        }

        const context = canvas.getContext("2d");

        if (!context) {
            setErrorRender(
                "No se pudo preparar la textura del producto."
            );
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = obtenerColorProducto(color);
        context.fillRect(0, 0, canvas.width, canvas.height);
        modelColorMaterialsRef.current.forEach((colorMaterial) => {
            colorMaterial.color.set(
                obtenerColorProducto(color)
            );
        });

        if (imagenDiseno && logo) {
            const x = (logo.x / 100) * canvas.width;
            const y = (logo.y / 100) * canvas.height;
            const width = (logo.width / 100) * canvas.width;
            const height = (logo.height / 100) * canvas.height;

            context.drawImage(
                imagenDiseno,
                x,
                y,
                width,
                height
            );
        }

        texture.needsUpdate = true;

        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }, [color, imagenDiseno, logo]);

    const aspectRatio =
        Number(logo?.aspectRatio) ||
        (
            Number(logo?.width) > 0 &&
            Number(logo?.height) > 0
                ? logo.width / logo.height
                : 1
        );

    const anchoMaximo =
        Math.max(
            0.1,
            Math.min(
                45,
                100 - Number(logo?.x || 0),
                (
                    100 -
                    MARGEN_TAZA_PORCENTAJE -
                    Math.max(
                        Number(logo?.y || 0),
                        MARGEN_TAZA_PORCENTAJE
                    )
                ) * aspectRatio,
                (
                    100 -
                    2 * MARGEN_TAZA_PORCENTAJE
                ) * aspectRatio
            )
        );
    const anchoMinimo = Math.min(4, anchoMaximo);

    function cambiarTamano(event) {
        if (!logo || !onLogoChange) {
            return;
        }

        const width = Number(event.target.value);
        const height = width / aspectRatio;

        onLogoChange({
            ...logo,
            width,
            height,
            x: Math.min(logo.x, 100 - width),
            y: Math.min(
                Math.max(
                    logo.y,
                    MARGEN_TAZA_PORCENTAJE
                ),
                100 -
                    MARGEN_TAZA_PORCENTAJE -
                    height
            )
        });
    }

    return (
        <section className="producto-3d-preview">
            <div
                ref={containerRef}
                className="producto-3d-viewport"
                onDragOver={(event) => event.preventDefault()}
                onDrop={onDrop}
            />

            {errorRender && (
                <p className="producto-3d-error" role="alert">
                    {errorRender}
                </p>
            )}

            {designUrl ? (
                <label className="producto-3d-size">
                    <span>
                        Tamaño del diseño
                        <strong>{Math.round(logo?.width || 0)}%</strong>
                    </span>
                    <input
                        type="range"
                        min={anchoMinimo}
                        max={anchoMaximo}
                        step="0.5"
                        value={Math.min(
                            Number(logo?.width || 4),
                            anchoMaximo
                        )}
                        onChange={cambiarTamano}
                    />
                </label>
            ) : (
                <p className="producto-3d-instructions">
                    Subí un diseño para verlo sobre el producto.
                </p>
            )}

            <p className="producto-3d-instructions">
                Arrastrá el diseño para ubicarlo y el producto para girarlo.
                En la taza se mantiene 1 cm de margen arriba y abajo.
                Usá la rueda o el control táctil para acercar y alejar.
            </p>
        </section>
    );
}
