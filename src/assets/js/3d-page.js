// let three;
// window.addEventListener('load', function () {
// import "./3d-module"
// console.log(objects);


    // let three = new ThreeD();
    three.init(config, objects);
    localStorage.removeItem('three-info');
    if(localStorage.getItem('three-info') === null){
        $('.js-first-info').addClass('active');
        localStorage.setItem('three-info', true);
        $('.js-first-info__close').on('click', function () {
            $('.js-first-info').removeClass('active');
        })
    }

    lang = checkLanguage();
// });
    function changeFloor(floor, data){
        if(floor){
            $('.js-info__active').addClass('active');
            $('.js-treeD__plane').removeClass('active');
        } else {
          // getPlaneFloor(data.house, data.floor);
            // window.cancelAnimationFrame(three.animates);
            $('.js-treeD__plane').addClass('active');
           $('.js-info__hover').removeClass('active');
           $('.js-info__active').removeClass('active');
        }
        three.controlsEnable(floor);
        three.activeAnimate(floor);
    }

    function getPlaneFloor(house, floor) {
      let data = "action=appsData"+"&floor="+floor+"&dom="+house;
      console.log(data);
      $.ajax({
        type: "POST",
        url: './appartment.json',
        data: data,
        success: function(response){
          //                $(".adding-list").append(data);
          //   debugger
          $('.js-add__apartment').html(response);
          // $('.apartmens-plan-wrap').html(response);
          $('.js-treeD__plane').addClass('active');
          $('.plan-floor-appartment-link').on('click', function (event) {
            event.preventDefault();
              $('.js-treeD__plane').removeClass('active');
            let data2 = "action=findAppId"+"&id="+$(this).attr('data-id')+"&type="+$(this).attr('data-type');
            console.log(data2);
            $.ajax({
              type: "POST",
              url: './appartment.json',
              data: data2,
              success: function (result) {
                $('.js-add__apartment').html(result);
                $('.js-treeD__plane').addClass('active');
              }
            })
          })
        },
        error: function(data) {
        console.log(data);
      }
      })
    }
    function checkLanguage() {
        if(window.location.pathname === '/en/3d/'){
            return 'en'
        } else if(window.location.pathname === '/ru/3d/'){
            return 'ru'
        } else {
            return 'ua'
        }
}

