import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import gsap from 'gsap'

import Stats from 'stats.js'

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

gsap.registerPlugin(ScrollToPlugin)
gsap.registerPlugin(ScrollTrigger)

let pointActived = false

/**
 * HTML Animations
 */
// Loader
const boxWidth = 2000,
    totalWidth = boxWidth * 2,  //  * n of boxes
    loadText1 = document.querySelectorAll("#no01 .box"),
    loadText2 = document.querySelectorAll("#no02 .box"),
    dirFromLeft = "+=" + totalWidth,
    dirFromRight = "-=" + totalWidth;

const mod = gsap.utils.wrap(0, totalWidth);

const marquee = (which, time, direction) => {
    gsap.set(which, {
        x: function (i) {
            return i * boxWidth;
        }
    });

    const action = gsap.timeline()
        .to(which, {
            x: direction,
            modifiers: {
                x: x => mod(parseFloat(x)) + "px"
            },
            duration: time,
            ease: 'none',
            repeat: -1
        });

    return action
}

gsap.timeline({ play: true })
    .add(marquee(loadText1, 15, dirFromLeft))
    .add(marquee(loadText2, 15, dirFromRight), 0)

// Navbar
const navbarButton = document.getElementById('navbar-button'),
    menuToggle = new gsap.timeline({ paused: true, reversed: true });

menuToggle
    .add('rotate')
    .to('#navbar-button .mid', .2, { scale: 0.1, opacity: 0, transformOrigin: '50% 50%' }, 'burg')
    .to('#navbar-button .top', .2, { y: '7' }, 'rotate')
    .to('#navbar-button .bot', .2, { y: '-7' }, 'rotate')
    .to('#navbar-button .top', .2, { rotationZ: 45, transformOrigin: '50% 50%' }, 'rotate')
    .to('#navbar-button .bot', .2, { rotationZ: -45, transformOrigin: '50% 50%' }, 'rotate')

navbarButton.onclick = async () => {
    if (menuToggle.reversed()) { // show menu
        menuToggle.restart()

        document.body.style.height = `${window.innerHeight}px`

        const menuElement = document.createElement('div')
        const menu = await fetch('pages/navbar/menu.html').then(res => res.clone().text())

        menuElement.innerHTML = menu
        menuElement.id = 'menu'

        document.body.appendChild(menuElement)

        gsap.fromTo('nav', {
            height: 0
        }, {
            height: '100vh',
            duration: 0.5,
            ease: 'linear',
            onComplete: () => {
                gsap.to('nav li button', {
                    y: 0,
                    duration: 1.5,
                    ease: 'power3.out',
                    stagger: 0.1
                });
            }
        })
    } else { // hide menu
        menuToggle.reverse()

        document.body.style.height = 'auto'

        gsap.to('nav li button', {
            y: '100%',
            duration: 0.5,
            ease: 'power3.out',
            stagger: 0.1,
            onComplete: () => {
                gsap.to('nav', {
                    height: 0,
                    duration: 0.5,
                    ease: 'linear',
                    onComplete: () => {
                        document.getElementById('menu').remove()
                    }
                })
            }
        })
    }
}

// Points
const handleShowAnimation = (title, element) => {
    if (!document.getElementById('text-point')) {
        const container = document.createElement('div')

        element.onmouseover = () => {
            if (!pointActived && activeState === 0) {
                gsap.to('.point', {
                    opacity: 0.25,
                    duration: 0.5
                })

                gsap.to(element, {
                    opacity: 1,
                    duration: 0.5
                })

                const text = document.createElement('p')

                text.innerHTML = title

                container.id = 'text-point'
                container.append(text)

                document.body.appendChild(container)

                gsap.fromTo(container, {
                    opacity: 0,
                }, {
                    opacity: 1,
                    duration: 0.5,
                    ease: 'power2.inOut'
                })
            }
        }

        element.onmouseleave = () => {
            if (!pointActived && activeState === 0) {
                gsap.to('.point', {
                    opacity: 1,
                    duration: 0.5
                })

                gsap.to(container, {
                    opacity: 0,
                    curosr: 'grab',
                    duration: 0.5,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        container.remove()
                    }
                })
            }
        }
    }
}

document.querySelectorAll('.point').forEach(element => {
    if (element.classList.contains('point-0')) handleShowAnimation('Mont-Blanc', element)
    else if (element.classList.contains('point-1')) handleShowAnimation('Incinerator', element)
    else if (element.classList.contains('point-2')) handleShowAnimation('Chamonix', element)
})

/**
 * Base
 */
// Points
const points = [
    {
        position: new THREE.Vector3(-5.949, 4.667, -4.812),
        element: document.querySelector('.point-0'),
        index: 0
    },
    {
        position: new THREE.Vector3(4.393, 0.522, -15.092),
        element: document.querySelector('.point-1'),
        index: 1
    },
    {
        position: new THREE.Vector3(3.875, 0.823, -4.492),
        element: document.querySelector('.point-2'),
        index: 2
    }
]

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.fog = new THREE.Fog(0xffffff, 0.1, 70)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1.6)
scene.add(ambientLight)

const light = new THREE.HemisphereLight(0x56affc, 0x56affc, 1);
light.position.set(0, 0.4, 0)
light.intensity = 1
scene.add(light);

const directionalLight = new THREE.DirectionalLight(new THREE.Color('white'), 0.5)
directionalLight.castShadow = true
directionalLight.position.y = 15
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Models
 */
const gltfLoader = new GLTFLoader()
let modelMontBlanc, modelBarrier1, modelBarrier2

// const textureLoader = new THREE.TextureLoader()
// const texture = textureLoader.load('models/mont_blanc_massif_photographed_from_iss/textures/MontBlanc_VandeHei_1M_u0_v0.001_baseColor.jpeg')
// const textureRoughness = textureLoader.load('MontBlanc_VandeHei_1M_u0_v0.001_metallicRoughness.png')
// const material = new THREE.MeshBasicMaterial({ map: texture })

// texture.flipY = false
// texture.encoding = THREE.sRGBEncoding
// texture.outputEncoding = THREE.sRGBEncoding
// texture.minFilter = THREE.NearestFilter
// texture.magFilter = THREE.NearestFilter

gltfLoader.load('models/barrier/scene.gltf', (gltf) => {
    const childrens = [...gltf.scene.children]

    console.log(childrens, 'childrens');

    modelBarrier1 = childrens[1]
    modelBarrier2 = childrens[1].clone()

    modelBarrier1.position.set(-6.000, 4.546, -4.838)
    modelBarrier1.scale.set(0.050, 0.050, 0.050)
    modelBarrier1.rotateY(-0.2)

    modelBarrier2.position.set(-5.976, 4.530, -4.750)
    modelBarrier2.scale.set(0.070, 0.070, 0.070)
    modelBarrier2.rotateZ(-0.38)

    scene.add(modelBarrier1, modelBarrier2)
})

gltfLoader.load('models/mont_blanc_massif_photographed_from_iss/scene.gltf', (gltf) => {
    const childrens = [...gltf.scene.children]

    for (const children of childrens) {
        modelMontBlanc = children

        modelMontBlanc.castShadow = true

        modelMontBlanc.traverse(child => {
            // child.material = material
        })

        // modelMontBlanc.scale.set(1, 1, 1)
        scene.add(modelMontBlanc)
    }

    if (document.getElementById('load')) {
        controls.target.copy(modelMontBlanc.position)

        // show website
        gsap.to('#load div.progress-bar', {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                // show world
                points.map(point => {
                    const originalPosition = point.position

                    gsap.fromTo(point.position, {
                        x: point.position.x,
                        y: 25,
                        z: point.position.z
                    }, {
                        x: originalPosition.x,
                        y: originalPosition.y,
                        z: originalPosition.z,
                        ease: 'back.out(1.4)',
                        duration: 1
                    })
                })

                gsap.fromTo(modelMontBlanc.position, {
                    x: modelMontBlanc.position.x,
                    y: 25,
                    z: modelMontBlanc.position.z
                }, {
                    x: 0,
                    y: 0,
                    z: 0,
                    duration: 1,
                    ease: 'back.inOut(2.4)',
                    onUpdate: () => {
                        modelMontBlanc.position.y = modelMontBlanc.position.y
                    }
                })

                gsap.to('#load', {
                    opacity: 0,
                    duration: 2,
                    onComplete: () => {
                        document.querySelector('#load').remove()
                    }
                })
            }
        })
    }
}, e => {
    console.log(e)

    const percent = Math.round((e.loaded / e.total) * 100)

    gsap.to('#load div.progress-bar', {
        width: percent === Infinity ? '200vw' : `${percent * 2}vw`,
        duration: 0.25
    })
}, console.error)

/**
 * Mouse
 */
let activeState = 0

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 1e3)
scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas })
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0xffffff, 1)

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.enableZoom = false
controls.minPolarAngle = Math.PI / 2.25
controls.maxPolarAngle = Math.PI / 2.25
controls.minDistance = 50
controls.maxDistance = 50
controls.autoRotate = true
controls.autoRotateSpeed = 1

const handleShowMenu = element => {
    activeState = 0

    if (element) gsap.to(element, {
        y: -50,
        opacity: 0,
        duration: 0.5,
        ease: 'back.in(1.4)',
        onComplete: () => {
            element.remove()
            pointActived = false
        }
    })

    gsap.to(camera.position, {
        x: 50,
        y: 2,
        z: -50,
        duration: 1,
        ease: 'back.in(1.4)',
        onUpdate: () => {
            camera.position.set(camera.position.x, camera.position.y, camera.position.z)
        }
    })

    gsap.to(camera, {
        fov: 50,
        duration: 1,
        ease: 'back.in(0.5)',
        onUpdate: () => {
            camera.fov = camera.fov
            camera.updateProjectionMatrix()
        },
        onComplete: () => {
            if (modelMontBlanc) {
                const currentPosition = controls.position0

                gsap.to(currentPosition, {
                    x: modelMontBlanc.position.x,
                    y: modelMontBlanc.position.y,
                    z: modelMontBlanc.position.z,
                    duration: 0.2,
                    ease: 'ease.out',
                    onUpdate: () => {
                        controls.target.copy(currentPosition)
                    }
                })
            }
        }
    })
}

handleShowMenu()

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const handleScrollCanvasOpacity = () => {
    gsap.to(['canvas', '#more-button', '.point', 'header.article-header'], {
        opacity: 1 - window.pageYOffset / 550,
        duration: 0.2,
        ease: 'ease.out',
        onUpdate: () => {
            const canvas = document.querySelector('canvas')
            const opacity = canvas.style.opacity

            if (opacity < 0) {
                camera.fov = 50
                camera.updateProjectionMatrix()
            } else {
                camera.fov = 5
                camera.updateProjectionMatrix()
            }
        }
    })
}

const tick = async () => {
    stats.begin()

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime

    previousTime = elapsedTime

    controls.update()

    if (activeState > 0 && !document.getElementById('close-button')) {
        controls.target.copy(points[activeState - 1].position)

        // add close/more button
        const moreButton = document.createElement('button')

        moreButton.id = 'more-button'
        moreButton.innerHTML = `
                    <p>View more</p>
                    <img src="assets/icons/arrow.webp" />
                `
        moreButton.onmouseover = () => {
            gsap.to('#more-button p', {
                rotateZ: -15,
                duration: 0.5,
                ease: 'back.out(1.4)'
            })
        }
        moreButton.onmouseleave = () => {
            gsap.to('#more-button p', {
                rotateZ: -10,
                duration: 0.5,
                ease: 'back.out(1.4)'
            })
        }
        moreButton.onclick = e => {
            e.preventDefault()
            e.stopPropagation()

            // scroll to article
            gsap.to(window, {
                scrollTo: 'article',
                duration: 1.5,
                ease: 'power4.inOut'
            });
        }

        const closeButton = document.createElement('button')

        closeButton.innerHTML = `
            <p>Close</p>
            <img src="assets/icons/cross.png" />
        `
        closeButton.id = 'close-button'
        closeButton.onmouseover = () => {
            gsap.to('#close-button p', {
                rotateZ: -15,
                duration: 0.5,
                ease: 'back.out(1.4)'
            })
        }
        closeButton.onmouseleave = () => {
            gsap.to('#close-button p', {
                rotateZ: -10,
                duration: 0.5,
                ease: 'back.out(1.4)'
            })
        }
        closeButton.onclick = e => {
            e.preventDefault()
            e.stopPropagation()

            const articleContainer = document.querySelector('article')

            if (articleContainer) {
                handleShowMenu(articleContainer)
                articleContainer.remove()

                window.removeEventListener('scroll', () => handleScrollCanvasOpacity())

                const articleHeader = document.querySelector('header.article-header')

                gsap.to([articleHeader, closeButton, moreButton], {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        articleHeader.remove()
                        closeButton.remove()
                        moreButton.remove()
                    }
                })
            }
        }

        document.body.append(closeButton, moreButton)

        gsap.fromTo([closeButton, moreButton], {
            opacity: 0
        }, {
            opacity: 1,
            stagger: 0.2,
            duration: 0.5,
            ease: 'back.in(1.4)'
        })

        // image parallax effect
        let getRatio = element => window.innerHeight / (window.innerHeight + element.offsetHeight);

        gsap.utils.toArray("article div#thumbnail img").forEach((element, i) => {
            gsap.to(element, {
                y: () => `${(-window.innerHeight * (1 - getRatio(element))) / 2}px`,
                ease: "none",
                scrollTrigger: {
                    trigger: element,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                    markers: false,
                    invalidateOnRefresh: true
                }
            })
        })

        // canvas parallax effect
        window.addEventListener('scroll', () => handleScrollCanvasOpacity())
    }

    switch (activeState) {
        case 1:
            if (!document.querySelector('article')) {
                // add text
                const articleContainer = document.createElement('article')
                const articleHeader = document.createElement('header')

                const article = await fetch('pages/articles/montblanc.html').then(res => res.clone().text())
                const articleHeaderContent = await fetch('pages/articles/header.html').then(res => res.clone().text())

                articleContainer.innerHTML = article

                articleHeader.innerHTML = articleHeaderContent
                articleHeader.classList.add('article-header')

                document.body.append(articleHeader, articleContainer)

                document.getElementById('article-title').innerHTML = 'Mont-Blanc'
                document.getElementById('article-subtitle').innerHTML = '4809 m, the highest mountain of Europe 🇪🇺'

                // show header
                gsap.fromTo(['#article-title', '#article-subtitle'], {
                    x: '-100%',
                    opacity: 0
                }, {
                    x: 0,
                    opacity: 1,
                    ease: 'back.out(0.9)',
                    duration: 0.5,
                    stagger: 0.2
                })

                gsap.fromTo('header.article-header div.shadow', {
                    opacity: 0
                }, {
                    opacity: 1,
                    ease: 'none',
                    duration: 0.5
                })
            }
            break

        case 2:
            if (!document.querySelector('article')) {
                // add text
                const articleContainer = document.createElement('article')

                const article = await fetch('pages/articles/incinerator.html').then(res => res.clone().text())

                articleContainer.innerHTML = article

                document.body.appendChild(articleContainer)
            }
            break

        case 3:
            if (!document.querySelector('article')) {
                // add text
                const articleContainer = document.createElement('article')
                const articleHeader = document.createElement('header')

                const article = await fetch('pages/articles/chamonix.html').then(res => res.clone().text())
                const articleHeaderContent = await fetch('pages/articles/header.html').then(res => res.clone().text())

                articleContainer.innerHTML = article

                articleHeader.innerHTML = articleHeaderContent
                articleHeader.classList.add('article-header')

                document.body.append(articleHeader, articleContainer)

                document.getElementById('article-title').innerHTML = 'Chamonix'
                document.getElementById('article-subtitle').innerHTML = 'Open the way'

                // show header
                gsap.fromTo(['#article-title', '#article-subtitle'], {
                    x: '-100%',
                    opacity: 0
                }, {
                    x: 0,
                    opacity: 1,
                    ease: 'back.out(0.9)',
                    duration: 0.5,
                    stagger: 0.2
                })

                gsap.fromTo('header.article-header div.shadow', {
                    opacity: 0
                }, {
                    opacity: 1,
                    ease: 'none',
                    duration: 0.5
                })
            }
            break

        case 0:
            break
    }

    /**
     * Points
     */
    for (const point of points) {
        const screenPosition = point.position.clone()
        screenPosition.project(camera)

        const translateX = screenPosition.x * sizes.width * 0.5
        const translateY = -screenPosition.y * sizes.height * 0.5

        point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
        point.element.onclick = () => {
            pointActived = true

            gsap.to('.point', {
                opacity: 1,
                stagger: 0.2,
                duration: 0.5
            })

            const textPoint = document.getElementById('text-point')

            // remove text
            gsap.to(textPoint, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.inOut',
                onComplete: () => {
                    if (textPoint) textPoint.remove()

                    const currentPosition = controls.position0

                    gsap.to(currentPosition, {
                        x: points[point.index].position.x,
                        y: points[point.index].position.y,
                        z: points[point.index].position.z,
                        duration: 0.2,
                        ease: 'ease.out',
                        onUpdate: () => {
                            controls.target.copy(currentPosition)
                        },
                        onComplete: () => {
                            // transition to description
                            gsap.to(camera, {
                                fov: 5,
                                duration: 2,
                                ease: 'back.in(1.4)',
                                onUpdate: () => {
                                    controls.target.copy(points[point.index].position)

                                    camera.fov = camera.fov
                                    camera.updateProjectionMatrix()
                                }
                            }).then(() => {
                                activeState = point.index + 1
                            })
                        }
                    })
                }
            })
        }
    }

    // Update controls
    controls.update(deltaTime)

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    stats.end()
}

tick()