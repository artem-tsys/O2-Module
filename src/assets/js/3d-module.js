import map from 'async';
export default function ThreeD(setting,changeFloor2 ) {
    let self = this;
    let scene, camera, controls, renderer, intersects, pointObj,saleObj, defaultPositionCamera;
    let {defaultPath , path, ratio=1, type='desctop',info, houseInfo,langText} = setting;
    let changeFloor = changeFloor2;
    let animationFlags = false;
    let lang = checkLanguage();
    let cameraPositionStep = 0;
    let currentDirectionCamera = {x: 0, z: 0, y: 0};
    let activeObjectFrom = new THREE.Vector3(0, 0, 0);
    let lastActiveFloor = {};
    let cam = {};
    let points = [];
    let animateTimes = 0;
    let hover = true;
    let currentFloor = null;
    const compass = $('.compas')[0];
    let loadedSizeFiles = 0;

    let dir = new THREE.Vector3();
    let sph = new THREE.Spherical();

    const defaultDirectionCamera = {x: 0, y: 0, z: 0};
    const infoButtonEl = $('.js-info__button')[0];
    const buttonClose = document.querySelector('.js__zoom-house-closed');
    const activeObject = {
        position: {
            from: {},
            to: {}
        },
        purpose: {
            from: new THREE.Vector3(0, 0, 0),
            to: new THREE.Vector3(0, 0, 0),
        },
        obj: ''
    };
    let raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let houses = [];

    let hoverObject = null;

    const change = {
        house: false,
        section: false,
        floor: false
    };
    this.animates = () => {};

    let infoButton = function () {};

    function checkLanguage() {
        if(window.location.pathname === '/en/3d/'){
            return 'en'
        } else if(window.location.pathname === '/ru/3d/'){
            return 'ru'
        } else {
            return 'ua'
        }
    }
    function initCamera(config) {
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1000 * ratio, config.range * ratio || 50000 * ratio);
        camera.position.set(config.position.x * ratio || 0, config.position.y * ratio || 0, config.position.z * ratio || 0);
        camera.rotation.set(config.rotation.x || 0, config.rotation.y || 0, config.rotation.z || 0);
        camera.lookAt(config.lookAt.x || 0, config.lookAt.y || 0, config.lookAt.z || 0);
    }

    function initRender(id) {
        renderer = new THREE.WebGLRenderer({antialias: true, alpha: false, powerPreference: 'high-performance'});
        THREE.Cache.enabled = true;

        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById(id).appendChild(renderer.domElement);
    }

    function initAmbientLight(setting) {
        const amLight = new THREE.AmbientLight(setting.color || 0xffffff, setting.intensive || 1);
        scene.add(amLight);
    }

    function initDirectionalLight(setting) {
        const lightDirectional = new THREE.DirectionalLight(setting.color || '#ffffff', setting.intensive || 1.8);
        lightDirectional.position.x = setting.position.x * ratio || 5000;
        lightDirectional.position.y = setting.position.y * ratio || 10000;
        lightDirectional.position.z = setting.position.z * ratio || 20000;
        scene.add(lightDirectional);
    }

    function addControls(config) {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.maxDistance = config.maxDistance * ratio || Infinity;
        controls.minDistance = config.minDistance * ratio || 5000;
        controls.zoomSpeed = config.zoomSpeed || 1;
        controls.rotateSpeed = config.rotateSpeed || 1;
        controls.panSpeed = config.panSpeed || 1;
        controls.enableKeys = config.enableKeys;
        controls.enablePan = config.enablePan;
        controls.enableRotate = config.enableRotate;
        controls.maxPolarAngle = config.maxPolarAngle || Math.PI;
        controls.minPolarAngle = config.minPolarAngle || 0;
        controls.autoRotate = config.autoRotate;
        controls.autoRotateSpeed = config.autoRotateSpeed || 1;
    }

    this.init = function (config, objects) {
        path = config.path;
        ratio = config.ratio;
        type = config.type;
        scene = new THREE.Scene();

        initCamera(config.camera);
        initRender(config.blockId);
        initAmbientLight(config.ambientLight);
        addControls(config.controller);
        initDirectionalLight(config.directionLight);
        createRoom(config.room);

        load(objects, config);

        defaultPositionCamera = config.camera.position;
        cam.cam1 = addWindow(config.windowCam.cam1);
        cam.cam2 = addWindow(config.windowCam.cam2);
        cam.cam3 = addWindow(config.windowCam.cam3);
        cam.cam4 = addWindow(config.windowCam.cam4);
        cam.cam5 = addWindow(config.windowCam.cam5);
        cam.cam6 = addWindow(config.windowCam.cam6);
        // cubeCam = cubeCamera();

        window.addEventListener('resize', onWindowResize, false);
        if (type === 'desktop') {
            document.querySelector('canvas').addEventListener('mousedown', onDocumentMouseClick);
            document.querySelector('canvas').addEventListener('mousemove', hoverSection);
        } else if(type === 'mobile') {
            document.querySelector('canvas').addEventListener('touchstart', onDocumentMouseClick);
        }

        // document.getElementsByClassName('js-back')[0].addEventListener('click', back);
        buttonClose.addEventListener('click', closedInfo);
        
        
        $('.js-close__apart').on('click', () => {
          currentFloor = null;
          changeFloor(true, {}, houseInfo)
        });
        $('.js-info__button').on('click', function () {
          infoButton()
        });
      $('.js-change-floor__btn--prev').on('click', function () {
        currentFloor = currentFloor-1;
        const data = {
          ...intersects.userData,
          floor: currentFloor,
        };
        changeFloor(false, data, houseInfo);
      });
      $('.js-change-floor__btn--next').on('click', function () {
        currentFloor = currentFloor+1;
        const data = {
          ...intersects.userData,
          floor: currentFloor,
        };
       changeFloor(false, data, houseInfo);
      });
    };

    async function getHouse() {
        await fetch(defaultPath + '/assets/static/appartment.json').then(response => response.json()).then(datas => {
            let data = datas;
            // let data = JSON.parse(datas);
            for (let key in data) {
                for (let sec in data[key]) {
                    houseInfo['house' + data[key].dom][sec] = data[key][sec];
                }
            }
        })
        // request for flats/apartments
        // await $.ajax({
        //     url: '/wp-content/themes/o2/assets/appData.json',
        //     // method:'POST',
        //     // data: {action: 'dataJson'},
        // }).then(datas => {
        //     let data = datas;
        //     // let data = JSON.parse(datas);
        //     for (let key in data) {
        //         for (let sec in data[key]) {
        //             houseInfo['house' + data[key].dom][sec] = data[key][sec];
        //         }
        //     }
        // })
    }

    function addWindow(pos) {
        let Camera1 = new THREE.CubeCamera(0.001, 100000, 1024);
        Camera1.position.set(pos.x * ratio, pos.y * ratio, pos.z * ratio);
        Camera1.scale.set(10, 10, 10);
        return Camera1;
    }

    // function cubeCamera() {
    //     return new THREE.CubeTextureLoader().setPath(path + 'cubeCamera/').load(['px.jpeg', 'nx.jpeg', 'py.jpeg', 'ny.jpeg', 'pz.jpeg', 'nz.jpeg',]);
    // }

    function controlsFixed(active) {
        controls.enableZoom = active;
        // change.floor = active;
    }

    this.controlsEnable = (flag) => flag ? controls.enables = true : controls.enables = false;

    // async function loadAppartments() {
    //     fetch('./assets/js/appartments.json')
    //         .then(data => data.json())
    //         .then(datas => {
    //             // console.log(datas);
    //         })
    // }


//create models
  function getPathObjects(config) {
    const result = Object.entries(config).flatMap(([key, value]) => {
      if (key === 'treeConfig' || key === 'lands') {
        return getPathObjects(value);
      }
      const keysPath = ['url', 'map', 'alphaMap'];
      return keysPath.reduce((acc, key) => {
        if (value.hasOwnProperty(key)) {
          (key === 'url') ? acc.push(path + value[key]+ '.obj') : acc.push(value[key]);
        }
        return acc;
      }, [])
    });
    return result;
  }
  
  function getFileSize(path) {
    const promise = new Promise((resolve, reject) => {
      var sizeRequest = $.ajax({
        type: "HEAD",
        url: path,
        success: function (response) {
          var fileSize = parseInt(sizeRequest.getResponseHeader("Content-Length")) / 1048576;
          resolve(fileSize)
        },
        error: (err) => {
          reject(err);
        },
      });
    });
    return promise;
  }
  function getSizeFiles(fileConfig) {
    const filePath = getPathObjects(fileConfig);
    const promise = Promise.all(filePath.map(getFileSize));
    promise.then((results) => {
      const sizeFiles = results.reduce((acc, value) => {
        if (acc >= 0) {
          return acc + value;
        }
        return 0;
      });
      console.log(sizeFiles);
    });
  }
    async function load(objects, config) {
        getSizeFiles(objects);
        createWater(objects.water);
        await getHouse();
        pointObj = await loaderObj({url: 'Obj/point'}, null);
        saleObj = await loaderObj({url: 'Obj/sale2'}, null);
        
        await getPositionObjects(objects);
        addModel(config.houseSale);

        await loader(objects.landscape);
        await repeat(objects.lands);
        await repeat(objects.treeConfig);
        await loader(objects.land_shadow);
        renderer.render(scene, camera);
      
        console.log(282, loadedSizeFiles / 1048576);
        setTimeout(()=>{
            document.querySelector('.preloader').style.display = "none";
        }, 500);

        cam.cam1.update(renderer, scene);
        cam.cam2.update(renderer, scene);
        cam.cam3.update(renderer, scene);
        cam.cam4.update(renderer, scene);
        cam.cam5.update(renderer, scene);
        cam.cam6.update(renderer, scene);
        animate();
    }

    async function loader(config) {
        let texture = await loaderMaterial(config);
        let object = await loaderObj(config, texture);
        if (config.model.length > 1 && !config.type) {
            scene.add(ModelRepeatR(config, object.children[0].geometry, texture[Object.keys(texture)[0]]));
        } else if (config.model.length > 1 && config.type) {
            scene.add(ModelRepeatR(config, object.children[0].geometry, texture));
        } else {
            scene.add(setConfig(object, config));
        }
        renderer.render(scene, camera);
    }

    async function repeat(list) {
        let result = new THREE.Group();
        for (let key in list) {
            result.add(await loaderNew(list[key]));
        }
        scene.add(result);
    }

    async function loaderNew(config) {
        let texture = await loaderMaterial(config);
        let object = await loaderObj(config, texture);
        let res = [];

        if (config.model.length > 1 && !config.type) {
            res = ModelRepeatR(config, object.children[0].geometry, texture[Object.keys(texture)[0]]);
        } else if (config.model.length > 1 && config.type) {
            res = ModelRepeatR(config, object.children[0].geometry, texture);
        } else if (type === "desktop" && config.name === 'info') {
            res = setConfig(object, config);
            res.children.forEach( obj => {
                obj.material = obj.material.clone();
                obj.material.transparent = true;
                obj.material.opacity = 0;
            } );
        } else {
            res = setConfig(object, config);
        }
        return res
    }

    async function loaderMtl(config) {
      let result;
      let totalSize = 0;
      const mtlLoader = new THREE.MTLLoader();
      mtlLoader.setPath(path);
      const materialUrl = config.url + ".mtl";
      let promise = new Promise(resolve => {
          mtlLoader.load(materialUrl, function (materials) {
              loadedSizeFiles += totalSize;
              materials.preload();
              resolve(materials.materials);
          }, (xhr) => {
            totalSize = xhr.total;
          });
      });

      await promise.then(data => result = data);
      return result;
    }

    async function loaderObj(config, texture, callback, group) {
        let result = {};
        const objLoader = new THREE.OBJLoader2();
        objLoader.setLogging(false, true);
        objLoader.setMaterials(texture);
        let totalSize = 0;
        let promise = new Promise(resolve => {
            objLoader.load(path + config.url + '.obj', object => {
              loadedSizeFiles += totalSize;
              resolve(object.detail.loaderRootNode)
            }, (xhr) => {
              totalSize = xhr.total;
            }, null, null, false);
        });

        await promise.then(data => {
            result = data;
            if (callback !== undefined) callback(data, group);
        });

        return result;
    }
    async function loaderMaterial(config) {
        let material;
        if (config.type === 'Basic') {
            material = new THREE.MeshBasicMaterial();
            set(config, material, false);
        } else if (config.type === 'Phong') {
            material = new THREE.MeshPhongMaterial();
            set(config, material, false);
        } else {
            material = await loaderMtl(config);
            set(config, material, true);

        }
        return material;
    }

    // set config material
    function set(config, texture, flag) {
        let material;
        flag ? material = texture[Object.keys(texture)[0]] : material = texture;

        if (config.repeatMap) {
            const texture2 = new THREE.TextureLoader().load(config.repeatMap, function (textures) {
                textures.wrapS = textures.wrapT = THREE.RepeatWrapping;
                textures.repeat.set(config.repeatH, config.repeatW);
            });
            material.map = texture2;
        }
        if (config.depthFunc) {
            material.depthFunc = THREE.NotEqualDepth;
        }
        if (config.anisotropy) {
            material.anisotropy = config.anisotropy;
        }
        if (config.map) {
            material.map = loaderTexture(config.map);
        }
        if (config.color) {
            material.color = new THREE.Color(config.color);
        }
        if (config.alphaMap) {
            material.alphaMap = loaderTexture(config.alphaMap);
        }
        if (config.lightMap) {
            material.lightMap = loaderTexture(config.lightMap);
        }
        if (config.blending) {
            material.premultipliedAlpha = true;
            material.blending = THREE.CustomBlending;
            material.blendEquation = THREE.AddEquation;
            material.blendSrc = THREE.ZeroFactor;
            material.blendDst = THREE.SrcColorFactor;
        }
        if (config.side) {
            material.side = THREE.DoubleSide;
        }
        if (config.shininess) {
            material.shininess = config.shininess;
        }
        if (config.reflectivity) {
            material.reflectivity = config.reflectivity;
        }

        if (config.alphaTest) {
            material.alphaTest = config.alphaTest;
        }
        if (config.opacity) {
            material.opacity = config.opacity;
        }
        if (config.transparent === false || config.transparent === true) {
            material.transparent = config.transparent;
        }

        return flag ? texture[Object.keys(texture)[0]] = material : texture;
    }

    function ModelRepeatR(objects, geometry, material) {
        let element = [];
        objects.model.forEach(elem => {
            const obj = geometry.clone();
            const scaleY = objects.scale && objects.scale.y ? objects.scale.y : randomInteger(9, 12) / 10;
            const scale = objects.scale === 'auto' ? randomInteger(9, 12) / 10 : 1;
            if (elem.rotate && elem.rotate.y >= 0) {
                obj.rotateY(elem.rotate.y);
            } else {
                obj.rotateY(randomInteger(0, 2));
            }
            obj.applyMatrix(new THREE.Matrix4().makeTranslation(elem.position.x * ratio, elem.position.y, elem.position.z * ratio));
            obj.scale(scale, scaleY, scale);

            element.push(obj)
        });

        const geometriesCubes = THREE.BufferGeometryUtils.mergeBufferGeometries(element);
        const arr = new THREE.Mesh(geometriesCubes, material);
        arr.name = objects.name;
        return arr;
    }

    function setConfig(obj, conf) {
        let object = obj;
        const config = conf.model[0];
        if (conf.name) {
            object.name = conf.name;
        }
        if (config.position && config.position.x) {
            object.position.x = config.position.x * ratio
        }
        if (config.position && config.position.y) {
            object.position.y = config.position.y * ratio
        }
        if (config.position && config.position.z) {
            object.position.z = config.position.z * ratio
        }

        if (config.scale && config.scale.x) {
            object.scale.x = config.scale.x
        }
        if (config.scale && config.scale.y) {
            object.scale.y = config.scale.y
        }
        if (config.scale && config.scale.z) {
            object.scale.z = config.scale.z
        }

        if (config.rotation && config.rotation.x) {
            object.rotation.x = config.rotation.x
        }
        if (config.rotation && config.rotation.y) {
            object.rotation.y = config.rotation.y
        }
        if (config.rotation && config.rotation.z) {
            object.rotation.z = config.rotation.z
        }
        return object;
    }

    function createRoom(config) {
        const texture = loaderTexture(config.img);
        const materials = new THREE.MeshBasicMaterial({map: texture, side: THREE.BackSide});
        const geometry = new THREE.CylinderBufferGeometry(config.radius * ratio, config.radius * ratio, config.height, config.radialSegment, config.heightSegment, true);

        const boxMesh = new THREE.Mesh(geometry, materials);
        boxMesh.position.set(config.position.x * ratio, config.position.y * ratio, config.position.z * ratio);
        scene.add(boxMesh);
    }

    function createWater(params) {
        let waterGeometry = new THREE.PlaneBufferGeometry(params.width * ratio, params.height * ratio);
        const mapWater = loaderTexture('waternormals.jpg;');
        let water = new THREE.Water(waterGeometry, {
            color: params.color,
            scale: params.scale,
            flowDirection: new THREE.Vector2(params.flowX, params.flowY),
            reflectivity: params.reflectivity,
            flowSpeed: params.flowSpeed,
            normalMap0: mapWater,
            normalMap1: mapWater,
        });

        water.position.y = params.position.y * ratio;
        water.position.x = params.position.x * ratio;
        water.position.z = params.position.z * ratio;
        water.rotation.x = Math.PI * -0.5;
        water.rotation.z = params.rotate;
        scene.add(water);
    }

    // create house
    function addModel(houseSale) {
        let group = new THREE.Group();
        let points = new THREE.Group();
        group.name = 'house';
        points.name = 'points';
        let houseModel = {
            type1: {
                url: 'Obj/house/House_type-1',
                texture: {
                    winMap: loaderTexture(path + 'maps/house/type1/type1_win.jpg'),
                    winSpecularMap: loaderTexture(path + 'maps/house/type1/type1_win_refl.jpg'),
                    balconMap: new THREE.TextureLoader().load(path + 'maps/house/type1/Reshotka_D.jpg', function (textures) {
                        textures.wrapS = textures.wrapT = THREE.RepeatWrapping;
                        textures.repeat.set(35, 35);
                    }),
                    balconAlphaMap: new THREE.TextureLoader().load(path + 'maps/house/type1/Reshotka_mask.jpg', function (textures) {
                        textures.wrapS = textures.wrapT = THREE.RepeatWrapping;
                        textures.repeat.set(35, 35);
                    }),
                }
            },
            type2: {
                url: 'Obj/house/House_type-2',
                texture: {
                    winMap: loaderTexture(path + 'maps/house/type2/Dom2_win_all.jpg'),
                    winSpecularMap: loaderTexture(path + 'maps/house/type2/Dom2_win_all_refl.jpg'),
                    balconMap: new THREE.TextureLoader().load(path + 'maps/house/type2/Reshotka_D.jpg', function (textures) {
                        textures.wrapS = textures.wrapT = THREE.RepeatWrapping;
                        textures.repeat.set(35, 35);
                    }),
                    balconAlphaMap: new THREE.TextureLoader().load(path + 'maps/house/type2/Reshotka_mask.jpg', function (textures) {
                        textures.wrapS = textures.wrapT = THREE.RepeatWrapping;
                        textures.repeat.set(35, 35);
                    }),
                }
            },
            type3: {
                url: 'Obj/house/House_type-3',
                texture: {
                    winMap: loaderTexture(path + 'maps/house/type3/Dom3_win.jpg'),
                    winSpecularMap: loaderTexture(path + 'maps/house/type3/Dom3_win_refl.jpg'),
                    balconMap: new THREE.TextureLoader().load(path + 'maps/house/type3/Reshotka_D.jpg', function (textures) {
                        textures.wrapS = textures.wrapT = THREE.RepeatWrapping;
                        textures.repeat.set(35, 35);
                    }),
                    balconAlphaMap: new THREE.TextureLoader().load(path + 'maps/house/type3/Reshotka_mask.jpg', function (textures) {
                        textures.wrapS = textures.wrapT = THREE.RepeatWrapping;
                        textures.repeat.set(35, 35);
                    }),
                }
            }
        };
        let houseTexture = [
            {
                name: 'house-1-1',
                line: 1,
                typeModel: 'type1',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom1_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-1',
                        position: {x: 18683.6953125, y: -10, z: 7204.2626953125},
                        point: {
                            map: path + 'maps/point/1.jpg',
                            up: 3000
                        },
                        sale: {
                            map: path + 'maps/'+ (houseSale['1'] ? 'sale' : 'no-sale') +'/'+ lang +'.jpg',
                            up: 3500
                        },
                        info: {
                            house: 1,
                            section: 1,
                        }
                    },
                ],
            },
            {
                name: 'house-2-1',
                line: 1,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom2_sec1_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-1',
                        position: {
                            x: 19603.822265625,
                            y: -10,
                            z: 2678.89306640625
                        },
                        point: {
                            map: path + 'maps/point/2.jpg',
                            up: 3000
                        },
                        sale: {
                            map: path + 'maps/'+ (houseSale['2'] ? 'sale' : 'no-sale') +'/'+ lang +'.jpg',
                            up: 3500
                        },
                        info: {
                            house: 2,
                            section: 1,
                        }
                    }
                ],
            },
            {
                name: 'house-2-2',
                line: 1,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom2_sec2_wall.jpg'),
                },
                model: [{
                    name: 'section-2',
                    position: {
                        x: 20027.6875,
                        y: -10,
                        z: 700.00927734375
                    },
                    info: {
                        house: 2,
                        section: 2,
                    }
                }
                ],
            },
            {
                name: 'house-2-3',
                line: 1,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom2_sec3_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-3',
                        position: {
                            x: 20449.44140625,
                            y: -10,
                            z: -1284.187255859375
                        },
                        info: {
                            house: 2,
                            section: 3,
                        }
                    }
                ],
            },
            {
                name: 'house-3-1',
                line: 2,
                typeModel: 'type1',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom3_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-1',
                        position: {x: 13526.998046875, y: -10, z: 6108.1728515625},
                        rotation: {y: -24 * (Math.PI / 180)},
                        scale: {x: -1},
                        point: {
                            map: path + 'maps/point/3.jpg',
                            up: 3000
                        },
                        sale: {
                            map: path + 'maps/'+ (houseSale['3'] ? 'sale' : 'no-sale') +'/'+ lang +'.jpg',
                            up: 3500
                        },
                        info: {
                            house: 3,
                            section: 1,
                        }
                    },
                ],
            },
            {
                name: 'house-4-1',
                line: 2,
                typeModel: 'type3',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom4_sec1_wall.jpg'),
                },
                model: [{
                    name: 'section-1',
                    position: {x: 14281.5166015625, y: -10, z: 1391.2490234375},
                    point: {
                        map: path + 'maps/point/4.jpg',
                        up: 3000
                    },
                    sale: {
                        map: path + 'maps/'+ (houseSale['4'] ? 'sale' : 'no-sale') +'/'+ lang +'.jpg',
                        up: 3500
                    },
                    info: {
                        house: 4,
                        section: 1,
                    }
                }],
            },
            {
                name: 'house-4-2',
                line: 2,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom4_sec2_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-2',
                        position: {
                            x: 14423.7587890625,
                            y: -10,
                            z: -784.6046142578125
                        },
                        scale: {x: -1},
                        rotation: {y: -12 * (Math.PI / 180)},
                        info: {
                            house: 4,
                            section: 2,
                        }
                    }
                ],
            },
            {
                name: 'house-4-3',
                line: 2,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom4_sec3_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-3',
                        position: {
                            x: 14423.7587890625,
                            y: -10,
                            z: -2813.12939453125
                        },
                        rotation: {y: -12 * (Math.PI / 180)},
                        scale: {x: -1},
                        info: {
                            house: 4,
                            section: 3,
                        }
                    }
                ],
            },
            {
                name: 'house-5-1',
                line: 3,
                typeModel: 'type1',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom5_wall.jpg'),
                },
                model: [{
                    name: 'section-1',
                    position: {x: 5410.4912109375, y: -10, z: 4382.97265625},
                    point: {
                        map: path + 'maps/point/5.jpg',
                        up: 3000
                    },
                    sale: {
                      map: path + 'maps/'+ (houseSale['5'] ? 'sale' : 'no-sale') +'/'+ lang +'.jpg',
                        up: 3500
                    },
                    info: {
                        house: 5,
                        section: 1,
                    }
                }],
            },
            {
                name: 'house-6-1',
                line: 3,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom6_sec1_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-1',
                        position: {x: 6426.63916015625, y: -10, z: 130.11},
                        point: {
                            map: path + 'maps/point/6.jpg',
                            up: 3000
                        },
                        sale: {
                            map: path + 'maps/'+ (houseSale['6'] ? 'sale' : 'no-sale') +'/'+ lang +'.jpg',
                            up: 3500
                        },
                        info: {
                            house: 6,
                            section: 1,
                        }
                    }],
            },
            {
                name: 'house-6-3',
                line: 3,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom6_sec3_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-3',
                        position: {x: 7797.3681640625, y: -10, z: -3828.771484375},
                        rotation: {y: -12 * (Math.PI / 180)},
                        info: {
                            house: 6,
                            section: 3,
                        }
                    }],
            },
            {
                name: 'house-6-4',
                line: 3,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom6_sec4_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-4',
                        position: {x: 8622.443359375, y: -10, z: -5681.92138671875},
                        rotation: {y: -12 * (Math.PI / 180)},
                        info: {
                            house: 6,
                            section: 4,
                        }
                    }],
            },
            {
                name: 'house-6-2',
                line: 3,
                typeModel: 'type3',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom6_sec2_wall.jpg'),
                },
                model: [{
                    name: 'section-2',
                    position: {x: 7025, y: -10, z: -1965},
                    rotation: {y: 168 * (Math.PI / 180)},
                    info: {
                        house: 6,
                        section: 2,
                    }
                }],
            },
            {
                name: 'house-7-1',
                line: 4,
                typeModel: 'type1',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom7_wall.jpg'),
                },
                model: [{
                    name: 'section-1',
                    position: {x: 242.75519561767578, y: -10, z: 3286.531982421875},
                    rotation: {y: 155 * (Math.PI / 180)},
                    scale: {z: -1},
                    point: {
                        map: path + 'maps/point/7.jpg',
                        up: 3000
                    },
                    sale: {
                        map: path + 'maps/'+ (houseSale['7'] ? 'sale' : 'no-sale') +'/'+ lang +'.jpg',
                        up: 3500
                    },
                    info: {
                        house: 7,
                        section: 1,
                    }
                }],
            },
            {
                name: 'house-8-2',
                line: 4,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom8_sec2_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-2',
                        position: {x: 1265.2918701171875, y: -10, z: -3351.2939453125},
                        rotation: {y: Math.PI / -15},
                        scale: {x: -1},
                        info: {
                            house: 8,
                            section: 2,
                        }
                    }
                ],
            },
            {
                name: 'house-8-3',
                line: 4,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom8_sec3_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-3',
                        position: {x: 1265.2919921875, y: -10, z: -5379.818359375},
                        rotation: {y: Math.PI / -15},
                        scale: {x: -1},
                        info: {
                            house: 8,
                            section: 3,
                        }
                    }
                ],
            },
            {
                name: 'house-8-4',
                line: 4,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom8_sec4_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-4',
                        position: {x: 1265.2921142578125, y: -10, z: -7408.3427734375},
                        rotation: {y: Math.PI / -15},
                        scale: {x: -1},
                        info: {
                            house: 8,
                            section: 4,
                        }
                    },
                ],
            },
            {
                name: 'house-8-1',
                line: 4,
                typeModel: 'type3',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom8_sec1_wall.jpg'),
                },
                model: [{
                    name: 'section-1',
                    position: {x: 1120, y: -10, z: -1175},
                    point: {
                        map: path + 'maps/point/8.jpg',
                        up: 3000
                    },
                    sale: {
                        map: path + 'maps/'+ (houseSale['8']) ? 'sale' : 'no-sale' +'/'+ lang +'.jpg',
                        up: 3500
                    },
                    info: {
                        house: 8,
                        section: 1,
                    }
                },
                ],
            },
            {
                name: 'house-9-1',
                line: 5,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom9_sec1_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-1',
                        position: {x: -6385.3876953125, y: -10, z: 1214.1090087890625},
                        point: {
                            map: path + 'maps/point/9.jpg',
                            up: 3000
                        },
                        sale: {
                            map: path + 'maps/'+ (houseSale['9'] ? 'sale' : 'no-sale') +'/'+ lang +'.jpg',
                            up: 3500
                        },
                        info: {
                            house: 9,
                            section: 1,
                        }
                    }
                ],
            },
            {
                name: 'house-9-2',
                line: 5,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom9_sec2_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-2',
                        position: {x: -6807.138671875, y: -10, z: 3198.306640625},
                        info: {
                            house: 9,
                            section: 2,
                        }
                    }
                ],
            },
            {
                name: 'house-9-3',
                line: 5,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom9_sec3_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-3',
                        position: {x: -7228.8896484375, y: -10, z: 5182.50439453125},
                        info: {
                            house: 9,
                            section: 3,
                        }
                    }
                ],
            },
            {
                name: 'house-9-4',
                line: 5,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom9_sec4_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-4',
                        position: {x: -7650.640625, y: -10, z: 7166.7021484375},
                        info: {
                            house: 9,
                            section: 4,
                        }
                    }
                ],
            },
            {
                name: 'house-9-6',
                line: 5,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom9_sec6_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-6',
                        position: {x: -8146, y: -10, z: 11320},
                        rotation: {y: 12.5 * (Math.PI / 180)},
                        info: {
                            house: 9,
                            section: 6,
                        }
                    },
                ],
            },
            {
                name: 'house-9-5',
                line: 5,
                typeModel: 'type3',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom9_sec5_wall.jpg'),
                },
                model: [{
                    name: 'section-5',
                    position: {x: -8026, y: -10, z: 9150},
                    rotation: {y: 180.4 * (Math.PI / 180)},
                    info: {
                        house: 9,
                        section: 5,
                    }
                },
                ],
            },
            {
                name: 'house-10-1',
                line: 5,
                typeModel: 'type3',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom10_sec1_wall.jpg'),
                },
                model: [{
                    name: 'section-1',
                    position: {x: -5565, y: -10, z: -2470},
                    rotation: {y: -24.2 * (Math.PI / 180)},
                    scale: {x: -1},
                    point: {
                        map: path + 'maps/point/10.jpg',
                        up: 3000
                    },
                    sale: {
                        map: path + 'maps/'+ (houseSale['10'] ? 'sale' : 'no-sale') +'/'+ lang +'.jpg',
                        up: 3500
                    },
                    info: {
                        house: 10,
                        section: 1,
                    }
                },
                ],
            },
            {
                name: 'house-10-2',
                line: 5,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom10_sec2_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-2',
                        position: {x: -4806.646484375, y: -10, z: -4518.5947265625},
                        rotation: {y: -12.5 * (Math.PI / 180)},
                        info: {
                            house: 10,
                            section: 2,
                        }
                    }
                ],
            },
            {
                name: 'house-10-3',
                line: 5,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom10_sec3_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-3',
                        position: {x: -3981.57421875, y: -10, z: -6371.7451171875},
                        rotation: {y: -12.5 * (Math.PI / 180)},
                        info: {
                            house: 10,
                            section: 3,
                        }
                    },
                ],
            },
            {
                name: 'house-11-2',
                line: 6,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom11_sec2_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-2',
                        position: {x: -12324.5927734375, y: -10, z: 2218.8251953125},
                        rotation: {y: 168 * (Math.PI / 180)},
                        info: {
                            house: 11,
                            section: 2,
                        }
                    }
                ],
            },
            {
                name: 'house-11-3',
                line: 6,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom11_sec3_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-3',
                        position: {x: -13149.666015625, y: -10, z: 4071.9775390625},
                        rotation: {y: 168 * (Math.PI / 180)},
                        info: {
                            house: 11,
                            section: 3,
                        }
                    }
                ],
            },
            {
                name: 'house-11-4',
                line: 6,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom11_sec4_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-4',
                        position: {x: -13974.7392578125, y: -10, z: 5925.1298828125},
                        rotation: {y: 168 * (Math.PI / 180)},
                        info: {
                            house: 11,
                            section: 4,
                        }
                    }
                ],
            },
            {
                name: 'house-11-5',
                line: 6,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom11_sec5_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-5',
                        position: {x: -14799.8125, y: -10, z: 7778.2822265625},
                        rotation: {y: 168 * (Math.PI / 180)},
                        info: {
                            house: 11,
                            section: 5,
                        }
                    }
                ],
            },
            {
                name: 'house-11-6',
                line: 6,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom11_sec6_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-6',
                        position: {x: -15624.8857421875, y: -10, z: 9631.4345703125},
                        rotation: {y: 168 * (Math.PI / 180)},
                        info: {
                            house: 11,
                            section: 6,
                        }
                    }
                ],
            },
            {
                name: 'house-11-7',
                line: 6,
                typeModel: 'type2',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom11_sec7_wall.jpg'),
                },
                model: [
                    {
                        name: 'section-7',
                        position: {x: -16449.958984375, y: -10, z: 11484.5869140625},
                        rotation: {y: 168 * (Math.PI / 180)},
                        info: {
                            house: 11,
                            section: 7,
                        }
                    }
                ],
            },
            {
                name: 'house-11-1',
                line: 6,
                typeModel: 'type3',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom11_sec1_wall.jpg'),
                },
                model: [{
                    name: 'section-1',
                    position: {x: -11575, y: -10, z: 175},
                    rotation: {y: -24 * (Math.PI / 180)},
                    scale: {z: -1},
                    point: {
                        map: path + 'maps/point/11.jpg',
                        up: 3000
                    },
                    sale: {
                        map: path + 'maps/'+ (houseSale['11'] ? 'sale' : 'no-sale') +'/'+ lang +'.jpg',
                        up: 3500
                    },
                    info: {
                        house: 11,
                        section: 1,
                    }
                }],
            },
            {
                name: 'house-12-1',
                line: 6,
                typeModel: 'type1',
                texture: {
                    wallMap: loaderTexture(path + 'maps/house/dom12_wall.jpg'),
                },
                model: [{
                    name: 'section-1',
                    position: {x: -10646.2783203125, y: -10, z: -4289.560546875},
                    point: {
                        map: path + 'maps/point/12.jpg',
                        up: 3000
                    },
                    sale: {
                        map: path + 'maps/'+ (houseSale['12'] ? 'sale' : 'no-sale') +'/'+ lang +'.jpg',
                        up: 3500
                    },
                    info: {
                        house: 12,
                        section: 1,
                    }
                }],
            }
        ];

        for (let key in houseModel) {
            downloadObj(key, houseModel[key], group, points, houseTexture);
        }
        scene.add(group);
        scene.add(points);
    }

    function downloadObj(key, config, group, points, texture) {
        const objLoader = new THREE.OBJLoader2();
        objLoader.setLogging(false, true);
        objLoader.load(path + '' + config.url + '.obj', object => {
            texture.map(house => {
                if (house.typeModel === key) {
                    ModelRepeat(house, object.detail.loaderRootNode, group, points, config)
                }
            });
        }, null, null, null, false);
    }

    function loaderTexture(url) {
      let totalSize = 0;
        return new THREE.TextureLoader().load(url, (data) => {
          loadedSizeFiles += totalSize;
        });
    }

    function ModelRepeat(houseConfig, object, group, points, config) {
        houseConfig.model.forEach(house => {
            group.add(createModelHouse(houseConfig, house, object, config, points));
        })
    }

    function createModelHouse(allModelConf, modelConf, object1, config, points) {
        const configDefault = {
            name: modelConf.name || '',
            position: {
                x: modelConf.position && modelConf.position.x ? modelConf.position.x * ratio : 0,
                y: modelConf.position && modelConf.position.y ? modelConf.position.y * ratio : 0,
                z: modelConf.position && modelConf.position.z ? modelConf.position.z * ratio : 0,
            },
            scale: {
                x: modelConf.scale && modelConf.scale.x ? modelConf.scale.x : 1,
                y: modelConf.scale && modelConf.scale.y ? modelConf.scale.y : 1,
                z: modelConf.scale && modelConf.scale.z ? modelConf.scale.z : 1,
            },
            rotation: {
                x: modelConf.rotation && modelConf.rotation.x ? modelConf.rotation.x : 0,
                y: modelConf.rotation && modelConf.rotation.y ? modelConf.rotation.y : 0,
                z: modelConf.rotation && modelConf.rotation.z ? modelConf.rotation.z : 0,
            }
        };
        const model = object1.clone();
        model.position.set(configDefault.position.x, configDefault.position.y, configDefault.position.z);
        model.scale.set(configDefault.scale.x, configDefault.scale.y, configDefault.scale.z);
        model.rotation.set(configDefault.rotation.x, configDefault.rotation.y, configDefault.rotation.z);
        model.name = 'house';
        model.userData.line = allModelConf.line;
        model.userData.typeModel = allModelConf.typeModel;
        model.userData.house = modelConf.info.house;
        model.userData.section = modelConf.info.section;
        model.userData.button = 'Обрати секцію';
        let index = 0;
        let y = null;
        model.children.forEach( (floor,i) => {
            if( floor.name.includes('Floor1') || floor.name.includes('floor1') || floor.name.includes('floor-1') || floor.name.includes('Floor-1')){
                // model.remove(model.children[i])
                y = i;
            }
            if ( floor.name.includes('Floor') || floor.name.includes('floor') || floor.name === 'wrapper') {
                index += 1;
                floor.userData.url = '';
                floor.userData.house = modelConf.info.house;
                floor.userData.section = modelConf.info.section;
                floor.userData.floor = index;
                floor.userData.button = 'Обрати поверх';
            }

        });

        if(!isNaN(y)) model.remove(model.children[y]);
        model.userData.floor = index;

        if (modelConf.point) {
            points.add(createPoint(modelConf, pointObj, 'point' ));
        }
        if(modelConf.sale &&  houseInfo['house' +model.userData.house].dom ) {
            points.add(createPoint(modelConf, saleObj, 'sale' ));
        }
        setTexture(model, allModelConf, config);

        houses['house' + model.userData.house] ? '' : houses['house' + model.userData.house] = {};
        houses['house' + model.userData.house]['section' + model.userData.section] = model;
        return houses['house' + model.userData.house]['section' + model.userData.section];
    }

    //create point up house
    function createPoint(modelConf, obj, type) {
        let point = obj.clone();
        point.children[1].material = new THREE.MeshBasicMaterial({map: loaderTexture( modelConf[type].map)});
        point.children[0].material = new THREE.MeshBasicMaterial({color: new THREE.Color(0x568652)});
        point.position.set(modelConf.position.x * ratio, modelConf.position.y * ratio + modelConf[type].up * ratio, modelConf.position.z * ratio);
        points.push(point);
        return point;
    }

    //set texture house
    function setTexture(model, texture, config) {
        let obj = model;
        obj.children.map((child) => {
            if (child.name.includes('wall') || child.name.includes('Wall')) {
                child.material = new THREE.MeshBasicMaterial({
                    map: texture.texture.wallMap,
                    transparent: false,
                });
            } else if (child.name.includes('win')) {
                child.material = new THREE.MeshStandardMaterial({
                    map: config.texture.winMap,
                    envMap: cam['cam' + obj.userData.line].renderTarget.texture,
                    envMapIntensity: 1,
                    metalness: 0.6,
                    roughness: 0.7,
                    color: new THREE.Color('#a6a9b9')
                });
                cam.cam1.update(renderer, scene);
            } else if (child.name.includes('balcon') || child.name.includes('balkon')) {
                child.material = new THREE.MeshBasicMaterial({
                    map: config.texture.balconMap,
                    alphaMap: config.texture.balconAlphaMap,
                    side: THREE.DoubleSide,
                    alphaTest: 0.12,
                    transparent: false,
                });
            } else if (child.name.includes('wrapper')) {
                child.visible = true;
                child.material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, premultipliedAlpha: true});
            } else {
                child.visible = false;
                child.material = new THREE.MeshBasicMaterial({
                    transparent: true,
                    opacity: 0,
                    premultipliedAlpha: true
                });
            }
        });
        return obj;
    }

    //получить позицию дома
    async function getPositionObjects(objects) {
        // await fetch('/wp-content/themes/o2/assets/assets/static/position.json').then(response => response.json())
        await fetch(defaultPath + '/assets/static/position.json').then(response => response.json())
            .then(data => {
                for (let type in data.tree) {
                    if (objects.treeConfig[type]) {
                        objects.treeConfig[type].model = data.tree[type].model;
                    }
                }
                objects.lands.fonar.model = data.fonar.model;
                objects.lands.paporotnik.model = data.paporotnik.model;
            });
    }

    function loadBoxTree(url, name) {
        const objLoader = new THREE.OBJLoader2();
        objLoader.setLogging(false, true);
        objLoader.load(path + url + '.obj', function (object) {
            let coordinate = [];
            let obj = object.detail.loaderRootNode;
            obj.position.set(0, 800, 0);
            obj.name = name;
            scene.add(obj);
            setTimeout(() => {
                obj.children.map(elem => coordinate.push(elem.geometry.boundingSphere.center));
                setJsonPos(coordinate)
            }, 2000);

            return true;
        }, null, null, null, false);
    }

    function setJsonPos(datas) {
        let fd = new FormData();
        datas.forEach((data, i) => fd.append(i, JSON.stringify(data)));
        fetch('./writer.php', {
            method: 'post',
            body: fd,
        }).then(response => {
            console.log(response);
        }).catch(function (res) {
            console.log(res)
        })
    }

    // create objects end

    function randomInteger(min, max) {
        return Math.floor(min + Math.random() * (max + 1 - min));
    }

// animations start
    function newCameraPosition(fromPos, toPos, fromDirection, toDirection) {
        let camPos = fromPos;
        let camDirect = fromDirection;
        camPos.lerp(toPos, 0.02 / (animateTimes * 0.82));
        camDirect.lerp(toDirection, 0.05 / (animateTimes * 0.82));
        camera.position.copy(camPos);
        controls.target.copy(camDirect);
        cameraPositionStep++;

        if (cameraPositionStep > Math.floor(animateTimes * 60)) {
            cameraPositionStep = 0;
            animationFlags = false;
        }

        return camPos;
    }

    function playAnimateCamera(obj, ind, far) {
        if (ind === 'return') {
            animateCamera(defaultDirectionCamera, defaultPositionCamera, far);
        } else {
            animateCamera(obj.position, obj.position, far);
        }
    }

    function animateCamera(currentTo, cameraTo, far) {
        activeObject.position.from = camera.position;
        activeObject.position.to = new THREE.Vector3(cameraTo.x, cameraTo.y + (far * ratio), cameraTo.z);
        activeObject.purpose.from = currentDirectionCamera;
        activeObject.purpose.to = currentTo;
        animationFlags = true;
        controls.saveState();
    }

    // animations end

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function searchClickObj(list) {
        for (let i = 0; i < list.length; i++) {
            let wrappers = scene.getObjectByName(list[i]);
            let intersects = [];
            if (wrappers instanceof THREE.Group && wrappers.name === list[i]) {
                intersects.push(raycaster.intersectObjects(wrappers.children, true));
            } else if (wrappers instanceof THREE.Mesh && wrappers.name === list[i]) {
                intersects.push(raycaster.intersectObject(wrappers));
            }

            if (intersects.length > 0 && intersects[0].length) {
                return intersects[0][0].object;
            }
        }
        return null;
    }
    // function searchClickObj(list) {
    //     let wrappers = scene.getObjectByName(list);
    //     let intersects = [];
    //     if (wrappers instanceof THREE.Group && wrappers.name === list) {
    //         intersects.push(raycaster.intersectObjects(wrappers.children, true));
    //     } else if (wrappers instanceof THREE.Mesh && wrappers.name === list) {
    //         intersects.push(raycaster.intersectObject(wrappers));
    //     }
    //
    //     if (intersects.length > 0 && intersects[0].length) {
    //         return intersects[0][0].object;
    //     }
    //     return null;
    // }

    function onDocumentMouseClick(event) {
        let mouseX;
        let mouseY;
        if (event.type === 'touchstart') {
            mouseX = event.changedTouches[0].clientX;
            mouseY = event.changedTouches[0].clientY;

            function checkT(e) {
                if (mouseX < e.changedTouches[0].clientX + 25 && mouseX > e.changedTouches[0].clientX - 25 && mouseY < e.changedTouches[0].clientY + 25 && mouseY > e.changedTouches[0].clientY - 25) {
                    mouse.x = ( mouseX / window.innerWidth ) * 2 - 1;
                    mouse.y = -( mouseY / window.innerHeight ) * 2 + 1;
                    renderTouchMove();
                }
                this.removeEventListener('touchend', checkT);
                this.removeEventListener('touchstart', exidFnT);
            }
            this.addEventListener('touchend', checkT);
            this.addEventListener('touchstart', exidFnT);

            function exidFnT() {
                this.removeEventListener('touchend', checkT);
                this.removeEventListener('touchstart', exidFnT);
            }

        } else {
            mouseX = event.clientX;
            mouseY = event.clientY;
            function check(e) {
                if (mouseX < e.clientX + 25 && mouseX > e.clientX - 25 && mouseY < e.clientY + 25 && mouseY > e.clientY - 25) {
                    mouse.x = ( mouseX / window.innerWidth ) * 2 - 1;
                    mouse.y = -( mouseY / window.innerHeight ) * 2 + 1;
                    renderMouseMove();
                }
                this.removeEventListener('mouseup', check);
                this.removeEventListener('mouseout', exidFn);
            }

            this.addEventListener('mouseup', check);
            this.addEventListener('mouseout', exidFn);

            function exidFn() {
                this.removeEventListener('mouseup', check);
                this.removeEventListener('mouseout', exidFn);
            }
        }
    }

    // function back() {
    //     shadowWrap();
    //     if (change.section || change.floor) {
    //         change.floor = false;
    //         change.section = false;
    //         change.house = false;
    //         let house;
    //         if (lastActiveFloor.userData.house) {
    //             house = lastActiveFloor.userData.house;
    //         } else {
    //             house = lastActiveFloor.parent.userData.house;
    //         }
    //
    //         if (+houseInfo['house' + house].secs === 1) {
    //             closedInfo();
    //             return;
    //         }
    //         mouseMove(lastActiveFloor, 'return');
    //         infoButton();
    //     } else if (change.house) {
    //         change.house = false;
    //         closedInfo();
    //     }
    // }

    function checkElement(flag) {
        if (flag === 'return') {
            return intersects.parent.userData;
        } else {
            return intersects.userData;
        }
    }

    function renderMouseMove() {
        raycaster.setFromCamera(mouse, camera);
        intersects = searchClickObj(['house']);
        mouseMove(intersects);
        renderer.render(scene, camera);
    }
    function renderTouchMove() {
        raycaster.setFromCamera(mouse, camera);
        intersects = searchClickObj(['house', 'info']);
        touchMove(intersects);
        renderer.render(scene, camera);
    }
    function touchMove(intersects) {
        if (intersects !== null) {
            if (!change.section && (activeObject.obj === '' || +activeObject.obj.userData.house === +intersects.parent.userData.house || +activeObject.obj.userData.house === +intersects.parent.userData.house)) {
                infoButtonEl.disabled = false;
                animateTimes = 1;
                let houseNum =  checkElement('return');

                lastActiveFloor = changeMaterialOpacity(intersects,lastActiveFloor);
                if(houseInfo['house' + intersects.parent.userData.house].dom){
                    setInfo('info__active','section', houseNum.house, houseNum.section, houseInfo['house' + houseNum.house].sections[houseNum.section].floors, houseInfo['house' + houseNum.house].sections[houseNum.section].rooms);
                } else {
                    setInfo('info__active','section', houseNum.house);
                }
                infoButton = eventClickInfoSection.bind(this,intersects, 'touch');
            }
            else if (!change.floor && (activeObject.obj === '' || activeObject.obj.parent.uuid === intersects.parent.uuid || +activeObject.obj.userData.house === +intersects.parent.userData.house)) {
                infoButtonEl.disabled = false;
                animateTimes = 0.5;
                let objParent = intersects.parent.userData;
                let obj = intersects.userData;
                setInfo('info__active','floor', objParent.house, obj.section, obj.floor, houseInfo['house' + obj.house].floors[objParent.floor + ''][obj.section + '']);
                activeFloor(intersects);
                infoButton = eventClickInfoFloor;
            }
        }
    }
    function mouseMove(intersects) {
        if (intersects !== null) {
            let objParent = intersects.parent.userData;
            if (!change.section && (activeObject.obj === '' || activeObject.obj.uuid !== intersects.parent.uuid )) {
                animateTimes = 1;
                $('.js-info__hover').css({'left': '-500px'});
                if(houseInfo['house' + intersects.parent.userData.house].dom){
                    setInfo('info__active', 'section', objParent.house, objParent.section, objParent.floor, houseInfo['house' + objParent.house].sections[objParent.section + ''].rooms);
                    eventClickInfoSection(intersects);
                }
            } else if(change.section && activeObject.obj.parent.uuid !== intersects.parent.uuid) {
                if(houseInfo['house' + intersects.parent.userData.house].dom){
                    setInfo('info__active', 'section', objParent.house, objParent.section, objParent.floor, houseInfo['house' + objParent.house].sections[objParent.section + ''].rooms);
                    eventClickInfoSection(intersects);
                }
            } else if (!change.floor && (activeObject.obj === '' || activeObject.obj.parent.uuid === intersects.parent.uuid || +activeObject.obj.userData.house === +intersects.parent.userData.house) && intersects.name.includes('floor')) {
                eventClickInfoFloor();
            }
        }
    }
    // function eventClickInfoHouse(houseNum){
    //     infoButtonEl.disabled = true;
    //     // change.house = true;
    //     controlsFixed(false);
    //     // for (let key in houses){houses[key].wrapp.visible = false;}
    //     if (+houseInfo['house' + houseNum.house].secs === 1) {
    //         changeFloorWrapp(houses['house' + houseNum.house].section1.children, 'floor', true);
    //         change.section = true;
    //
    //         playAnimateCamera(intersects.parent, 'start', 5000);
    //
    //         setTimeout(() => {
    //             animateHoverFloor(houses['house'+intersects.userData.house].section1);
    //         }, 500);
    //     } else {
    //         changeSection(houses['house'+houseNum.house],'wrapper', changeFloorWrapp, true, 'wrapper');
    //         playAnimateCamera(houseInfo['house' + houseNum.house], 'start', 20000);
    //     }
    //     activeObject.obj = intersects;
    //     // document.getElementsByClassName('js-back')[0].classList.add('active');
    // }

    function eventClickInfoSection(intersects, event) {
        controlsFixed(false);
        changeFloorWrapp(intersects.parent.children, 'floor', true);

        if(activeObject.obj){
            for (let key in activeObject.obj.parent.children) {
                if (activeObject.obj.parent.children[key].name.includes('wrapper')) {
                    activeObject.obj.parent.children[key].material.color = new THREE.Color('#ffffff');
                    activeObject.obj.parent.children[key].material.opacity = 0;
                }
            }
        }

        if(event === 'touch'){
            intersects.material.opacity = 0;
            intersects.material.color = new THREE.Color('#ffffff');
            intersects.visible = false;
        }

        for (let key in intersects.parent.children) {
            if (intersects.parent.children[key].name.includes('wrapper')) {
                intersects.parent.children[key].material.color = new THREE.Color('#26c606');
                intersects.parent.children[key].material.opacity = 0.2;
            }
        }
        playAnimateCamera(intersects.parent, 'start', 10000);

        activeObject.obj = intersects;
        change.section = true;
        $('.js-info__active').addClass('active');

        setTimeout(() => {
            animateHoverFloor(intersects.parent);
        }, 500);
    }

    function eventClickInfoFloor() {
      controlsFixed(false);
      currentFloor = intersects.userData.floor;
      changeFloor(false, intersects.userData, houseInfo);
    }

    function changeMaterialOpacity(intersects, element) {
        delActiveFloor(element);
        if(intersects.material.opacity === 0) { intersects.material.opacity = 0.2 } else {
            intersects.material.opacity = 0;
        }
        return intersects;
    }

    // function changeSection(el, id, callback, result, idCallback) {
    //     for (key in el) {
    //         if (el[key].name !== id) callback(el[key].children, idCallback, result);
    //     }
    // }

    function changeFloorWrapp(el, id, result) {
        for (let key in el) {
            if (el[key].name.includes(id)) changeR(el[key], result);
        }
    }

    function changeR(data, res) {
        data.visible = res;
    }

    function shadowWrap() {
        let house;
        if (activeObject.obj.userData.house) {
            house = houses["house" + activeObject.obj.userData.house];
        } else {
            house = houses["house" + activeObject.obj.parent.userData.house];
        }
        let elem = activeObject.obj.parent.children;
        for (let keys in elem) {
            if (elem[keys].name.includes("floor")) {
                changeR(elem[keys], false);
            } else if (elem[keys].name.includes("wrapper")) {
                elem[keys].material.color = new THREE.Color('#ffffff');
                elem[keys].material.opacity = 0;
            }
        }
    }

    function hoverSection(event) {
        if (hover) {
            let mouse2 = {};
            mouse2.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse2.y = -( event.clientY / window.innerHeight ) * 2 + 1;
            raycaster.setFromCamera(mouse2, camera);
            let intersects = searchClickObj(['house', 'info']);
            if (intersects !== null && intersects.parent.name === 'house') {
                let houseNum = intersects.parent.userData;
                $('body').css('cursor', 'pointer');
                setPositionInfo('.js-info__hover',event);
                if ((hoverObject === null || intersects !== hoverObject) && houseInfo['house' + intersects.parent.userData.house].dom) {
                    if (activeObject.obj && activeObject.obj.visible && activeObject.obj.userData.house === intersects.userData.house && activeObject.obj.userData.section === intersects.userData.section) {
                        intersects.visible = false;
                    } else if (intersects.name === 'wrapper') {
                        setInfo('info__hover', 'section', houseNum.house, houseNum.section, houseInfo['house' + houseNum.house].sections[houseNum.section].floors, houseInfo['house' + houseNum.house].sections[houseNum.section].rooms);
                        if (activeObject.obj) {
                            activeObject.obj.visible = true;
                            activeObject.obj.material.opacity = 0.2;
                        }
                    } else {
                        let objParent = intersects.parent.userData;
                        let obj = intersects.userData;
                        if(houseInfo['house' + obj.house] && houseInfo['house' + obj.house].floors && houseInfo['house' + obj.house].floors[intersects.userData.floor + '']){
                            setInfo('info__hover', 'floor', objParent.house, obj.section, obj.floor, houseInfo['house' + obj.house].floors[objParent.floor + ''][obj.section + '']);
                        }
                        // else {
                        //     setError('info__hover', 'floor', 'error');
                        // }

                    }
                    hoverObject = changeMaterialOpacity(intersects, hoverObject);
                } else if (!change.floor && (hoverObject === null || intersects !== hoverObject)) {
                    setInfo('info__hover', 'section', houseNum.house);
                    hoverObject = changeMaterialOpacity(intersects, hoverObject);
                }
            } else if (type === "desktop" && intersects !== null && intersects.parent.name === 'info') {
                if( hoverObject === null || intersects.name !== hoverObject.name  ) {
                    $('body').css('cursor', 'pointer');
                    $('.js-info__object').addClass('active');
                    $('.js-info__hover').removeClass('active');

                    $('.js-info__object').html(info[intersects.name][lang]);
                    setPositionInfo('.info__object',event);

                    if (hoverObject){hoverObject.material.opacity = 0;}
                    hoverObject = intersects;
                    hoverObject.material.opacity = 0.3;
                }
            } else if (hoverObject) {
                $('body').css('cursor', 'auto');
                $('.js-info__hover').removeClass('active');
                $('.js-info__object').removeClass('active');

                hoverObject.material.opacity = 0;
                hoverObject = null;
                if (activeObject.obj) {
                    activeObject.obj.visible = true;
                    activeObject.obj.material.opacity = 0.2;
                }
            }
        }
    }

    function setPositionInfo(clas,event) {
        $(clas).css({'top': event.clientY + 20, 'left': event.clientX + 20});
    }

    function activeFloor(intersect) {
        let int = intersect.parent, intHouse = intersect.parent.userData.house, obj = activeObject.obj,
            objPar = activeObject.obj.parent;
        if ((obj !== '' && objPar.uuid === int.uuid && objPar.name === int.name) || obj === '' || objPar.userData.house === intHouse || +obj.userData.house === intHouse) lastActiveFloor = changeMaterialOpacity(intersects, lastActiveFloor);
    }

    function delActiveFloor(el) {
        if (el && el.material) el.material.opacity = 0;
    }


    function animateHoverFloor(house) {
        let amount = 3;
        let floor = house.children.filter(el => el.name.includes('floor'));
        let fn = function fn(floor, j) {
            setTimeout(() => {
                lastActiveFloor = changeMaterialOpacity(floor[j], lastActiveFloor);
                hoverObject = floor[j];
            }, 100 * amount);
            amount += 1;
        };
        for (let j = 0; j < floor.length - 1; j++) {
            fn(floor, j);
        }
        for (let o = floor.length - 1; o >= 0; o--) {
            fn(floor, o);
        }

        setTimeout(() => {
            floor[0].material.opacity = 0;
        }, 100 * amount);
    }

    function setInfo(block, select, houseVal, secVal = '', floorVal = '', roomVal = '') {
        let room = $('.' + block + ' .js-info__room');
        let roomText = $('.' + block + ' .js-info__room--text');
        let floor = $('.' + block + ' .js-info__floor');
        let floorText = $('.' + block + ' .js-info__floor--text');
        let section = $('.' + block + ' .js-info__section');
        let sectionText = $('.' + block + ' .js-info__section--text');
        let build = $('.' + block + ' .js-info__build');
        let buildText = $('.' + block + ' .js-info__build--text');
        let sale = $('.' + block + ' .info__sale');
        let button = $('.js-info__button');

        $('.' + block + ' .info__build').removeClass('active');
        $('.' + block + ' .info__floor').removeClass('active');
        $('.' + block + ' .info__section').removeClass('active');
        $('.' + block + ' .info__room').removeClass('active');
        $('.' + block + ' .info__error').removeClass('active');

        if (build && select !== 'floor') {
            $('.' + block + ' .info__build').addClass('active');
            build.html(houseVal);
            buildText.html(langText[lang].house);
        }
        if (floorVal) {
            if(type === 'mobile'){
                button.html(langText[lang].button[select]);
                button.addClass('active');
            }else {
                button.removeClass('active');
            }

            sale.removeClass('active');
            if (section && secVal && select !== 'floor') {
                $('.' + block + ' .info__section').addClass('active');
                section.html(secVal);
                if (select === 'section' || select === 'floor') {
                    sectionText.html(langText[lang].section.selected);
                } else {
                    sectionText.html(langText[lang].section.notSelected);
                }
            }
            if (floor && floorVal) {
                $('.' + block + ' .info__floor').addClass('active');
                floor.html(floorVal);
                if (select === 'floor') {
                    floorText.html(langText[lang].floor.selected);
                } else {
                    floorText.html(langText[lang].floor.notSelected);
                }
            }
            if (room && roomVal) {
                $('.' + block + ' .info__room').addClass('active');
                room.html(roomVal);
                roomText.html(langText[lang].room);
            }
        } else {
            sale.html(langText[lang].closed);
            sale.addClass('active');
        }
        $('.js-' + block).addClass('active');
    }

    function setError(block, select, text) {

        $('.' + block + ' .info__build').removeClass('active');
        $('.' + block + ' .info__floor').removeClass('active');
        $('.' + block + ' .info__section').removeClass('active');
        $('.' + block + ' .info__room').removeClass('active');


        $('.' + block + ' .info__error').html(text).addClass('active');
        $('.js-' + block).addClass('active');
    }

    function closedInfo() {
        hover = true;
        if (activeObject.obj) {
            shadowWrap();
            animateTimes = 1;
            playAnimateCamera(null, 'return', 0);
            controlsFixed(true);
            delActiveFloor(lastActiveFloor);

            change.section = false;
            change.floor = false;
            activeObject.obj = '';
        }
        $('.js-info__active').removeClass('active');
    }

    let iuu = false;
    let vector = new THREE.Vector3();
    let theta;

    function rotatePoint() {
        camera.getWorldDirection(vector);
        theta = Math.atan2(vector.x, vector.z);
        points.forEach(point => point.rotation.set(0,theta,0));
    }

    this.activeAnimate = function (flag) {
        if (flag) {
            this.animates = animate();
        } else {
            window.cancelAnimationFrame(this.animates);
        }
    };
    function animate() {
        if (animationFlags) {
            newCameraPosition(activeObject.position.from, activeObject.position.to, activeObjectFrom, activeObject.purpose.to);
        }
        controls.update();
        renderer.render(scene, camera);

        camera.getWorldDirection(dir);
        sph.setFromVector3(dir);
        compass.style.transform = `rotate(${THREE.Math.radToDeg(sph.theta) }deg)`;
        if (iuu) {
            rotatePoint();
        }
        iuu = !iuu;
        self.animates = requestAnimationFrame(animate);
    }
};
