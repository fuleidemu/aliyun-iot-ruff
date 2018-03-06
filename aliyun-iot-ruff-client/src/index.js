'use strict';
var MQTT = require('aliyun-iot-device-mqtt');

// 个人账号
var options = {
    productKey: "",
    deviceName: "",
    deviceSecret: "",
    regionId: "cn-shanghai",
};
var pubTopic = "/" + options.productKey + "/" + options.deviceName + "/data";
var subTopic = "/" + options.productKey + "/" + options.deviceName + "/control";

var client = MQTT.createAliyunIotMqttClient(options);


var pm25Data = 0;
var pm10Data = 0;

$.ready(function(error) {
    if (error) {
        console.log(error);
        return;
    }

    //LCD显示屏
    $('#lcd').turnOn();
    $('#lcd').print('aliyun IoT');

    //5分钟上报一次
    setInterval(publishData, 5 * 60 * 1000);

    //按钮按下上报一次 
    $('#button').on('push', publishData);

    //空气质量
    $('#air').on('aqi', function(error, pm25, pm10) {
        if (error) {
            console.log(error);
            return;
        }
        pm25Data = pm25;
        pm10Data = pm10;
        //展示到LCD
        $('#lcd').setCursor(0, 1);
        $('#lcd').print("p2.5:" + pm25 + ",p10:" + pm10);
    });

});

$.end(function() {
    console.log("stop");
});

//上报温湿度
function publishData() {

    $('#humirature').getTemperature(function(error, temperature) {
        if (error) {
            console.error(error);
            return;
        }

        $('#humirature').getRelativeHumidity(function(error, humidity) {
            if (error) {
                console.error(error);
                return;
            }

            var data = {
                "temperature": temperature,
                "humidity": humidity,
                "pm25": pm25Data,
                "pm10": pm10Data
            };

            $('#lcd').clear();
            $('#lcd').setCursor(0, 0);
            $('#lcd').print("T:" + temperature + " C,H:" + humidity + "%");

            //异常数据不上报
            if (temperature > 40 || humidity > 100)
                return;

            console.log(JSON.stringify(data))
            client.publish(pubTopic, JSON.stringify(data));

        });

    });
}