let defaultPath = '';
const mobile = '/assets/img/3dModuleMobile/',
    desctop = '/assets/img/3dModule/';
let ratio = 1, type = "desktop",path = defaultPath + desctop;

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
    path = defaultPath + mobile;
    ratio = 0.5;
    type = "mobile";
}

let setting = {
    defaultPath: defaultPath,
    path : path,
    ratio : ratio,
    type : type,
    info : {
        admin_house: {
            ua: 'Адміністративний корпус',
            en: 'Administrative building',
            ru: 'Административный корпус'
        },
        beauty_saloon: {
            ua: 'Салон краси',
            en: 'Beauty saloon',
            ru: 'Салон красоты'
        },
        conference_center: {
            ua: 'Конференц-зал',
            en: 'Conference center',
            ru: 'Конференц центр'
        },
        green_house: {
            ua: 'Теплиці',
            en: 'Greenhouses',
            ru: 'Теплицы'
        },
        house_recreation: {
            ua: 'Будинок відпочинку',
            en: 'Holiday House',
            ru: 'Дом отдыха'
        },
        kindergarten: {
            ua: 'Дитячий садок',
            en: 'Kindergarten',
            ru: 'Детский сад'
        },
        ozero: {
            ua: 'Озеро',
            en: 'Lough',
            ru: 'Озеро'
        },
        pirs: {
            ua: 'Пірс',
            en: 'Pier',
            ru: 'Пирс'
        },
        school: {
            ua: 'Школа',
            en: 'School',
            ru: 'Школа'
        },
        spa: {
            ua: 'СПА',
            en: 'SPA',
            ru: 'СПА'
        },
        sport_place: {
            ua: 'Спорт майданчик',
            en: 'Playground',
            ru: 'Спорт площадка'
        }
    },
    houseInfo : {
        house1: {
            sections: '1',
            floors: 265,
            position: {x: 18683.695*ratio, y: 0, z: 7204.262*ratio},
        },
        house2: {
            secs: '3',
            position: {x: 20027.687*ratio, y: 0, z: 700.009*ratio}
        },
        house3: {
            secs: '1',
            position: {x: 13526.998*ratio, y: 0, z: 6108.172*ratio}
        },
        house4: {
            secs: '3',
            position: {x: 14423.758*ratio, y: 0, z: -784.604*ratio}
        },
        house5: {
            secs: '1',
            position: {x: 5410.491*ratio, y: 0, z: 4382.972*ratio}
        },
        house6: {
            secs: '4',
            position: {x: 7372.5*ratio, y: 0, z: -2820*ratio}
        },
        house7: {
            secs: '1',
            position: {x: 242.755*ratio, y: 0, z: 3286.531*ratio}
        },
        house8: {
            secs: '4',
            position: {x: 1265.291*ratio, y: 0, z: -6394*ratio}
        },
        house9: {
            secs: '6',
            position: {x: -7439*ratio, y: 0, z: 6190*ratio}
        },
        house10: {
            secs: '3',
            position: {x: -4806.646*ratio, y: 0, z: -4518.594*ratio}
        },
        house11: {
            secs: '7',
            position: {x: -13974.739*ratio, y: 0, z: 5925.129*ratio}
        },
        house12: {
            secs: '1',
            position: {x: -10646.278*ratio, y: 0, z: -4289.560*ratio}
        },
    },
    langText : {
        ua: {
            house: 'Будинок №',
            section: {
                selected: 'секція -',
                notSelected: 'секцій -'
            },
            floor: {
                selected: 'поверх -',
                notSelected: 'поверхів -'
            },
            room:  'квартир -',
            button: {
                house: 'Вибрати Будинок',
                section: 'Вибрати Секцію',
                floor: 'Вибрати поверх'
            },
            closed: 'будинок тимчасово не продається'
        },
        ru: {
            house: 'Дом №',
            section: {
                selected: 'секция -',
                notSelected: 'секций -'
            },
            floor: {
                selected: 'этаж -',
                notSelected: 'этажей -'
            },
            room:  'квартир -',
            button: {
                house: 'Выбрать Дом',
                section: 'Выбрать Секцию',
                floor: 'Выбрать Этаж'
            },
            closed: 'дом временно не продается'
        },
        en: {
            house: 'House №',
            section: {
                selected: 'section -',
                notSelected: 'sections -'
            },
            floor: {
                selected: 'floor -',
                notSelected: 'floors -'
            },
            room:  'apartments -',
            button: {
                house: 'Choose House',
                section: 'Select Section',
                floor: 'Choose Floor'
            },
            closed: 'the house is temporarily not for sale'
        }
    },
    config : {
        blockId: 'desktop',
        path: path,
        ratio: ratio,
        type: type,
        directionLight: {
            color: '#f6dfaf',
            intensive: 1.16,
            position: {
                x: 6848,
                y: 19244,
                z: 15783,
            }
        },
        ambientLight: {
            color: '#ffffff',
            intensive: 1.8,
        },
        controller: {
            maxDistance: 40000,
            minDistance: 10000,
            zoomSpeed: 1,
            rotateSpeed: 0.5,
            panSpeed: 0.1,
            enablePan: false,
            enableRotate: true,
            maxPolarAngle: Math.PI / 2 - 0.3,
            minPolarAngle: Math.PI / 2 - 0.9,
            screenSpacePanning: true,
            enableKeys: false,
        },
        camera: {
            range: 100000,
            position: {
                x: 0,
                y: 30000,
                z: -30000,
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0,
            },
            lookAt: {
                x: 0,
                y: 0,
                z: 0,
            },
        },
        room: {
            radius: 59000,
            height: 20000,
            radialSegment: 40,
            heightSegment: 20,
            position: {
                x: 3500,
                y: 10000,
                z: 3500
            },
            img: 'fon1.jpg',
        },
        windowCam: {
            cam1: {x: 19200, y: 3000, z: 5000},
            cam2: {x: 14000, y: 3000, z: 3000},
            cam3: {x: 6426, y: 3000, z: 136},
            cam4: {x: 1156, y: 3000, z: -1333},
            cam5: {x: -5544, y: 3000, z: -2625},
            cam6: {x: -13149, y: 3000, z: 4071}
        }
    },
    objects : {
        water: {
            width: 12000,
            height: 34000,
            reflectivity: 0.5,
            flowSpeed: 0.2,
            color: '#92acc3',
            scale: 10,
            flowX: 0,
            flowY: 0,
            position: {x: -330, y: -282, z: 31000},
            rotate: 1.95
        },
        landscape: {
            url: 'Obj/land/land',
            repeat: true,
            repeatMap: path + 'maps/land/grass_tile1.jpg',
            repeatW: 30,
            repeatH: 30,
            name: 'land',
            model: [{position: {x: 0, y: 0, z: 0}}]
        },
        land_shadow: {
            url: 'Obj/land/land_shadow',
            blending: true,
            alphaTest: 1,
            name: 'land-shadow',
            model: [{position: {x: -70, y: 25, z: 0}}]
        },

        land: {
            land_send: {
                url: 'Obj/land/send',
                repeat: true,
                repeatMap: path + 'maps/land/send.jpg',
                repeatW: 10,
                repeatH: 10,
                transparent: false,
                name: 'land-send',
                model: [{position: {x: 0, y: 20, z: 0}}]
            },
            land_bordur: {
                url: 'Obj/land/bordur',
                repeat: true,
                repeatMap: path + 'maps/land/bordur.jpg',
                repeatW: 500,
                repeatH: 500,
                transparent: false,
                name: 'land-bordur',
                model: [{position: {x: 0, y: 20, z: 0}}]
            },
            land_bicycle: {
                url: 'Obj/land/bicycle',
                repeat: true,
                repeatMap: path + 'maps/land/bicycle.jpg',
                repeatW: 50,
                repeatH: 50,
                transparent: false,
                name: 'land-bicycle',
                model: [{position: {x: 0, y: 15, z: 0}}]
            },
            land_ecopark: {
                url: 'Obj/land/ecopark',
                repeat: true,
                repeatMap: path + 'maps/land/ecopark.jpg',
                repeatW: 50,
                repeatH: 50,
                transparent: false,
                name: 'land-ecopark',
                model: [{position: {x: 0, y: 20, z: 0}}]
            },
            land_road: {
                url: 'Obj/land/road',
                repeat: true,
                repeatMap: path + 'maps/land/Asphalt1.jpg',
                repeatW: 50,
                repeatH: 50,
                transparent: false,
                name: 'land-road',
                model: [{position: {x: 0, y: 10, z: 0}}]
            },
            land_rozmetka: {
                url: 'Obj/land/rozmetka',
                repeat: true,
                repeatMap: path + 'maps/land/rozmetka.jpg',
                repeatW: 100,
                repeatH: 100,
                transparent: false,
                name: 'land-rozmetka',
                model: [{position: {x: 0, y: 25, z: 0}}]
            },
            land_tiles: {
                url: 'Obj/land/tiles',
                repeat: true,
                repeatMap: path + 'maps/land/tiles.jpg',
                repeatW: 120,
                repeatH: 120,
                transparent: false,
                name: 'land-tiles',
                model: [{position: {x: 0, y: 15, z: 0}}]
            },
            land_grass: {
                url: 'Obj/land/grass_inside',
                repeat: true,
                repeatMap: path + 'maps/land/grass_tile1.jpg',
                repeatW: 10,
                repeatH: 10,
                transparent: false,
                name: 'land-grass',
                model: [{position: {x: 0, y: 20, z: 0}}]
            },
            fonar: {
                name: 'fonar',
                url: 'Obj/land/fonar',
                repeat: true,
                repeatMap: path + 'maps/land/bordur.jpg',
                repeatW: 50,
                repeatH: 50,
                scale: {x: 1,y:1, z: 1},
                model: []
            },
            bench: {
                name: 'bench1',
                url: 'Obj/bench1',
                model: [{position: {x: 0, y: 10, z: 0}}]
            },
            bench2: {
                name: 'bench2',
                url: 'Obj/bench2',
                model: [{position: {x: 0, y: 10, z: 0}}]
            },
            paporotnik: {
                name: 'paporotnik',
                url: 'Obj/paporotnik',
                scale: {x: 1,y: 1, z: 1},
                model: []
            },
            angar: {
                name: 'angar',
                url: 'Obj/angar',
                // reflectivity: 0.5,
                model: [{position: {x: 0, y: 5, z: 0}}]
            },
            pirs: {
                name: 'pirs',
                url: 'Obj/house-pirs',
                model: [{position: {x: 0, y: 0, z: 0}}]
            },
            turnik: {
                url: 'Obj/turniki',
                name: 'turniki',
                model: [{position: {x: 0, y: 5, z: 0}}]
            },
            kit: {
                url: 'Obj/Kit',
                name: 'kit',
                transparent: false,
                model: [{position: {x: -130, y: 5, z: 0}}]
            },
            car: {
                name: 'car',
                url: 'Obj/car',
                model: [{position: {x: 0, y:20, z: 0}}]
            },
            // info: {
            //     name: 'info',
            //     type: 'Basic',
            //     url: 'Obj/info',
            //     transparent: true,
            //     opacity: 0,
            //     model: [{position: {x: 0, y: 0, z: 0}}]
            // }
        },
        treeConfig: {
            high1:{
                type: 'Basic',
                name: 'high1',
                url: 'Obj/Trees_el/El-high1',
                map: path + 'maps/trees_shadow/El-high1.jpg',
                alphaMap: path + 'maps/trees_shadow/El-high1_op.jpg',
                scale: {x: 1, z: 1},
                side: 'DoubleSide',
                alphaTest: 0.28,
                opacity: 0.8,
                transparent: true,
                anisotropy: 4,
                model: []
            },
            high2:{
                type: 'Basic',
                name: 'high2',
                url: 'Obj/Trees_el/El-high2',
                map: path + 'maps/trees_shadow/El-high2.jpg',
                alphaMap: path + 'maps/trees_shadow/El-high2_op.jpg',
                scale: {x: 1, z: 1},
                side: 'DoubleSide',
                alphaTest: 0.28,
                opacity: 0.9,
                transparent: true,
                anisotropy: 4,
                model: []
            },
            high3:{
                type: 'Basic',
                name: 'high3',
                url: 'Obj/Trees_el/El-high3',
                map: path + 'maps/trees_shadow/El-high3.jpg',
                alphaMap: path + 'maps/trees_shadow/El-high3_op.jpg',
                scale: {x: 1, z: 1},
                side: 'DoubleSide',
                alphaTest: 0.28,
                opacity: 0.8,
                transparent: true,
                anisotropy: 4,
                model: []
            },
            listva1: {
                type: 'Basic',
                name: 'list1',
                url: 'Obj/Trees_listva/listva1',
                map: path + 'maps/listva/trees_listva_color_red.jpg',
                alphaMap: path + 'maps/listva/trees_listva_color_Alpha.jpg',
                scale: {x: 1, z: 1},
                side: 'DoubleSide',
                alphaTest: 0.25,
                opacity: 0.5,
                model:[]
            },
            listva2: {
                type: 'Basic',
                name: 'list2',
                url: 'Obj/Trees_listva/listva1',
                map: path + 'maps/listva/trees_listva_color.jpg',
                alphaMap: path + 'maps/listva/trees_listva_color_Alpha.jpg',
                scale: {x: 1, z: 1},
                side: 'DoubleSide',
                alphaTest: 0.25,
                opacity: 0.5,
                model:[]
            },
            listva3: {
                type: 'Basic',
                name: 'list3',
                url: 'Obj/Trees_listva/listva2',
                map: path + 'maps/listva/trees_listva_color_yellow.jpg',
                alphaMap: path + 'maps/listva/trees_listva_color_Alpha.jpg',
                scale: {x: 1, z: 1},
                side: 'DoubleSide',
                alphaTest: 0.25,
                opacity: 0.5,
                model:[]
            },
            low1: {
                type: 'Basic',
                name: 'low1',
                url: 'Obj/tree/el',
                map: path + 'maps/el_low/trees_color1.jpg',
                alphaMap: path + 'maps/el_low/trees_color_alpha.jpg',
                scale: {x: 1, z: 1},
                side: 'DoubleSide',
                alphaTest: 0.25,
                opacity: 0.9,
                transparent: true,
                model:[]
            },
            low2: {
                type: 'Basic',
                name: 'low2',
                url: 'Obj/tree/el2',
                map: path + 'maps/el_low/trees_color.jpg',
                alphaMap: path + 'maps/el_low/trees_color_alpha.jpg',
                scale: {x: 1, z: 1},
                side: 'DoubleSide',
                alphaTest: 0.25,
                transparent: true,
                opacity: 1.1,
                model:[]
            },
            low3: {
                type: 'Basic',
                name: 'low3',
                url: 'Obj/tree/el3',
                map: path + 'maps/el_low/trees_color.jpg',
                alphaMap: path + 'maps/el_low/trees_color_alpha.jpg',
                scale: {x: 1, z: 1},
                side: 'DoubleSide',
                transparent: true,
                alphaTest: 0.25,
                opacity: 0.9,
                model:[]
            }
        },
        wrappers: {
            1:{
                url: 'Obj/house/wrap1', name: 'wrapBig', model: [
                    {position: {x: 18683.69, y: 0, z: 7204.26}},
                    {position: {x: 13526.99, y: 0, z: 6108.17}},
                    {position: {x: 5410.49, y: 0, z: 4382.97}},
                    {position: {x: 242.75, y: 0, z: 3286.53}},
                    {position: {x: -10646.27, y: 0, z: -4289.56}},
                ]
            },
            2:{
                url: 'Obj/house/wrap2', name: 'wrap2', model: [{position: {x: 0, y: 0, z: 0}}]
            },
            4:{
                url: 'Obj/house/wrap4', name: 'wrap4', model: [{position: {x: 0, y: 0, z: 0}}]
            },
            6:{
                url: 'Obj/house/wrap6', name: 'wrap6', model: [{position: {x: 0, y: 0, z: 0}}]
            },
            8:{
                url: 'Obj/house/wrap8', name: 'wrap8', model: [{position: {x: 0, y: 0, z: 0}}]
            },
            9:{
                url: 'Obj/house/wrap9', name: 'wrap9', model: [{position: {x: 0, y: 0, z: 0}}]
            },
            10:{
                url: 'Obj/house/wrap10', name: 'wrap10', model: [{position: {x: 0, y: 0, z: 0}}]
            },
            11:{
                url: 'Obj/house/wrap11', name: 'wrap11', model: [{position: {x: 0, y: 0, z: 0}}]
            }
        },
    },
};

if(setting.type === "desktop"){
    setting.objects.land.info = {
        name: 'info',
        type: 'Basic',
        url: 'Obj/info',
        transparent: true,
        opacity: 0,
        model: [{position: {x: 0, y: 0, z: 0}}]
    }
}

// export default setting;