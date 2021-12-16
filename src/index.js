import "./assets/js/three"
import "./assets/js/OrbitControls"
import "./assets/js/BufferGeometryUtils"
import "./assets/js/MTLLoader"
import "./assets/js/LoaderSupport"
import "./assets/js/OBJLoader2"
import "./assets/js/Reflector"
import "./assets/js/Refractor"
import "./assets/js/Water2"

import './assets/css/main.css';
import './assets/sass/main.scss';


import ThreeD from "./assets/js/3d-module"
let three;
window.addEventListener('load', function () {
    three = new ThreeD(setting,changeFloor);
    three.init(setting.config, setting.objects);
    $('#floor').on('click', hoverTooltip);

    $('.js-first-info__close').on('click', function () {
      $('.js-first-info').removeClass('active');
    });
    $('.js-first-info__open').on('click', function () {
      $('.js-first-info').addClass('active');
    });
    if (localStorage.getItem('three-info') === null) {
        $('.js-first-info').addClass('active');
        localStorage.setItem('three-info', true);
    }
});

function changeFloor(floor, data, houseInfo){
    three.controlsEnable(floor);
    three.activeAnimate(floor);
    if(floor){
        $('.js-info__active').addClass('active');
        $('.js-treeD__plane').removeClass('active');
    } else {
      getPlaneFloor(data.house, data.floor, houseInfo);
      $('.js-info__hover').removeClass('active');
      $('.js-info__active').removeClass('active');
    }
}
function getPlaneFloor(house, floor, houseInfo) {
    let data = "action=appsData"+"&floor="+floor+"&dom="+house;
    const btnNext = $('.js-change-floor__btn--next');
    const btnPrev = $('.js-change-floor__btn--prev');
    btnNext.css('pointer-events', 'none');
    btnPrev.css('pointer-events', 'none');
    $.ajax({
        type: "POST",
        url: '/wp-admin/admin-ajax.php',
        data: data,
        success: function(response){
            changeActiveButtonsFloor(house, floor, houseInfo);
            $('.js-add__apartment').html(response);
            $('#floor').on('mouseover', function () {
                $('.apartment-tooltip').css({
                    'opacity': 1, 'pointer-events': 'painted', 'left': '0px'
                })
            });
            $('#floor').on('mousemove', hoverTooltip);
            $('#floor').on('mouseout', function () {
                $('.apartment-tooltip').css({
                    'opacity': 0, 'pointer-events': 'none', 'left': '-100%'
                })
            });
            btnNext.css('pointer-events', 'painted');
            btnPrev.css('pointer-events', 'painted');
            $('.js-treeD__plane').addClass('active');
            $('.plan-floor-appartment-link').on('click', (e) =>  getApartment(e, house, floor, houseInfo));
            // $('.plan-floor-appartment-link').on('click', function (event) {
            //     event.preventDefault();
            //     $('.apartment-tooltip').css({
            //         'opacity': 0, 'left': '-100%'
            //     });
            //     $('.js-treeD__plane').removeClass('active');
            //     let data2 = "action=findAppId"+"&id="+$(this).attr('data-id')+"&type="+$(this).attr('data-type');
            //     $.ajax({
            //         type: "POST",
            //         url: '/wp-admin/admin-ajax.php',
            //         data: data2,
            //         success: function (result) {
            //             $('.js-add__apartment').html(result);
            //             $('.js-treeD__plane').addClass('active');
            //             $('.js-back').on('click',function () {
            //                 getPlaneFloor(house, floor);
            //             });
            //             $('.js-callback-form-3d').on('click', function () {
            //                 $('.js-callback-form').trigger('click');
            //             })
            //         }
            //     })
            // })
        },
        error: function(data) {
            console.log(data);
        }
    })
}
function getApartment(event, house, floor, houseInfo) {
  event.preventDefault();
  $('.apartment-tooltip').css({
    'opacity': 0, 'pointer-events': 'none', 'left': '-100%'
  });
  $('.js-treeD__plane').removeClass('active');

  const { id, type } =event.currentTarget.dataset;
  let data2 = "action=findAppId"+"&id="+id+"&type="+type;
  $.ajax({
    type: "POST",
    url: '/wp-admin/admin-ajax.php',
    data: data2,
    success: function (result) {
      $('.js-add__apartment').html(result);
      $('.js-treeD__plane').addClass('active');
      $('.js-back').on('click',function () {
        
        getPlaneFloor(house, floor, houseInfo);
      });
      $('.js-callback-form-3d').on('click', function () {
        $('.js-callback-form').trigger('click');
      })
    }
  })
}
function changeActiveButtonsFloor(house, floor, houseInfo) {
  if (floor <= 2) {
    $('.js-change-floor__btn--prev').addClass('hidden');
    $('.js-change-floor__btn--next').removeClass('hidden');
  } else if (houseInfo['house'+house].floor <= floor) {
    $('.js-change-floor__btn--next').addClass('hidden');
    $('.js-change-floor__btn--prev').removeClass('hidden');
  } else {
    $('.js-change-floor__btn--next').removeClass('hidden');
    $('.js-change-floor__btn--prev').removeClass('hidden');
  }
}
function hoverTooltip(e) {
    if(e.target.tagName === 'polygon'){
        var hover = $(e.target).closest('.plan-floor-appartment-link')[0];
        $('.js-apartment-tooltip__floor').html($(hover).attr('data-number'));
        $('.js-apartment-tooltip__squere').html($(hover).attr('data-square'));
        $('.js-apartment-tooltip__livsquere').html($(hover).attr('data-livsquare'));
        $('.js-apartment-tooltip__room').html($(hover).attr('data-flats'));
    }
}
