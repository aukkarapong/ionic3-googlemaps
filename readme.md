# IONIC 3 + GOOGLE MAPS

สิ่งที่ต้องเตรียมก่อนเริ่มเขียน

> node v8.17.0
>
> ionic 3.20.0

การ downgrade ionic, cordova, sass สำหรับ google map ที่จะเขียนในเนื้อหา (MacOS 10.15.7)

> sudo npm install -g cordova@8.1.0 ionic@3.20.0 sass@1.17.2

เริ่มต้น start new project

> ionic start my-ionic3-googlemaps blank

change directory ไปยัง project ที่สร้างขึ้น

> cd my-ionic3-googlemaps

ทดสอบรัน ionic serve ว่า project รันได้ไหม

> ionic serve

\
\

---

## เริ่มเขียน code IONIC 3 + GOOGLE MAPS

เริ่มแรกจะต้องสร้าง google maps api key [อ่านได้จากที่นี่](https://github.com/aukkarapong/ionic-3-kuse-demo/blob/master/Google-Maps.md#3-%E0%B8%AA%E0%B8%B4%E0%B9%88%E0%B8%87%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%95%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B9%80%E0%B8%95%E0%B8%A3%E0%B8%B5%E0%B8%A2%E0%B8%A1%E0%B8%81%E0%B9%88%E0%B8%AD%E0%B8%99%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B8%87%E0%B8%B2%E0%B8%99-google-maps-%E0%B8%9A%E0%B8%99-ionic-framework)

```text
ตัวอย่าง Key ที่สร้างไว้แล้ว

Android     :: AIzaSyAMTWAEPTLd3zV8MvCvCwOR_-h7m2-C6uQ
iOS         :: AIzaSyBOT7Z8bfbFtjDq9HOPmLZANb0QivxXUIY
Javascript  :: AIzaSyCeLt4q_rdFcYI6iAvEwq3m-QNtWh7iQSc
```

ขั้นตอนต่อมาเป็นการลง Plugin

```sh
ionic cordova plugin add cordova-plugin-googlemaps --variable API_KEY_FOR_ANDROID="Android Key ที่สร้างจาก step ข้างต้น" --variable API_KEY_FOR_IOS="iOS Key ที่สร้างจาก step ข้างต้น"
```

แต่ใน class นี้เราจะทำ Android only ก็ใช้ command แค่

```sh
ionic cordova plugin add cordova-plugin-googlemaps --variable API_KEY_FOR_ANDROID="Android Key ที่สร้างจาก step ข้างต้น"
```

install @ionic-native/core (version 4.17.0 สำหรับ ionic 3)

```sh
npm i --save @ionic-native/core@4.17.0
```

install @ionic-native/google-maps (version 4.15.1 สำหรับ ionic 3)

```sh
npm i --save @ionic-native/google-maps@4.15.1
```

เสร็จแล้วลอง run ดู
โดยเราจะลอง run บน browser ก่อน ด้วยคำสั่ง `ionic cordova run browser -l` เพื่อทดสอบการทำงานของ google map บน browser
หาก run ด้วย `ionic serve` plugin google map จะไม่ทำงาน

\

### ลงมือเขียน code กันเถอะ

---

> แก้ไข home.html เพิ่ม code
> เพื่อเตรียมพื้นที่สำหรับวาด map บนหน้าจอ และสร้างปุ่มไว้ 2 ปุ่มเพื่อ move `ไปยังตำแหน่งปัจจุบัน` และ `ดึงข้อมูลจาก API` มาปักหมุด

```html
<ion-content padding>
  <div id="map_canvas">
    <button ion-button>ตำแหน่งปัจจุบัน</button>
    <button ion-button>ดึงข้อมูลจาก API</button>
  </div>
</ion-content>
```

> แก้ไข home.scss
> เพื่อกำหนดความสูงของหน้าจอในการวาด map ให้สูงเต็มความสูงของจอ

```css
page-home {
  #map_canvas {
    height: 100%;
  }
}
```

> แก้ไข home.ts

import Platform

```js
import { NavController, Platform } from "ionic-angular";
```

import google-maps

```js
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker,
  Environment,
  GoogleMapsAnimation,
  MyLocation,
} from "@ionic-native/google-maps";
```

ประกาศ platform ใน construct

```js
constructor(public navCtrl: NavController, private platform: Platform) {

}
```

ประกาศตัวแปรเพื่อเก็บค่า

> map : เก็บค่าแผนที่
> location : เก็บค่าตำแหน่ง lat, lng

```js
map: GoogleMap;
location: any;
```

ตรวจสอบว่า platform พร้อมใช้งานหรือไม่ หากพร้อมแล้ว ให้ไปทำการเรียก function loadMap
โดยเราจะใส่ไว้ใน `ngAfterViewInit()` เพื่อให้มันทำงานหลังจากที่ view ได้ถูกสร้างขึ้นแล้ว

```js
ngAfterViewInit() {
  this.platform.ready().then(() => {
    this.loadMap();
  });
}
```

สร้าง function `loadMap` เพื่อวาด map

```js
loadMap() {
  Environment.setEnv({
    'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyCeLt4q_rdFcYI6iAvEwq3m-QNtWh7iQSc',
    'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyCeLt4q_rdFcYI6iAvEwq3m-QNtWh7iQSc'
  })

  this.map = GoogleMaps.create('map_canvas', {
    camera: {
      target: {
        lat: 13.736717,
        lng: 100.523186
      },
      zoom: 18,
      tilt: 30
    }
  })

  this.map.one(GoogleMapsEvent.MAP_READY)
  .then( () => {
    console.log(">>>> MAP_READY <<<<")
    this.map.on(GoogleMapsEvent.MAP_LONG_CLICK).subscribe( (data) => {
      console.log(data)
      this.map.clear()

      this.map.addMarker({
        title: `Click lat = ${data[0].lat} lng = ${data[0].lng}`,
        icon: 'blue',
        position: {
          lat: data[0].lat,
          lng: data[0].lng
        },
        snippet: 'click to save'
      })
      .then( marker => {
        this.map.animateCamera({
          target: data[0],
          zoom: 18,
          duration: 1000
        })

        marker.on( GoogleMapsEvent.INFO_CLICK ).subscribe( () => {
          console.log('INFO_CLICK')
        })
      })

    })
  })
}
```

เสร็จแล้วลอง run ดูด้วยคำสั่ง `ionic cordova run browser -l`

กำหนดให้ปุ่ม `ตำแหน่งปัจจุบัน` เรียก function เพื่อ move ตำแหน่งไปยังตำแหน่งปัจจุบัน

```html
<ion-content padding>
  <div id="map_canvas">
    <button ion-button (click)="gotoCurrentPosition($event)">
      ตำแหน่งปัจจุบัน
    </button>
    <button ion-button>ดึงข้อมูลจาก API</button>
  </div>
</ion-content>
```

สร้าง function `gotoCurrentPosition` เพื่อดึงตำแหน่งปัจจุบัน และ move แผนที่ไปตำแหน่งนั้น

```js
gotoCurrentPosition() {
  this.map.clear();
  // Get the location of you
  this.map.getMyLocation()
    .then((location: MyLocation) => {
      console.log('##### location #####');
      console.log(location);

      // Move the map camera to the location with animation
      this.map.animateCamera({
        target: location.latLng,
        zoom: 17,
        tilt: 30
      })
      .then(() => {
        // add a marker
        let marker: Marker = this.map.addMarkerSync({
          title: '@ionic-native/google-maps plugin!',
          snippet: 'This plugin is awesome!',
          position: location.latLng,
          animation: GoogleMapsAnimation.BOUNCE
        });

        // show the infoWindow
        marker.showInfoWindow();

        // If clicked it, display the alert
        marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
          console.log('##### MARKER_CLICK #####');
        });
      });
    });
}
```

เสร็จแล้วลอง run ดูด้วยคำสั่ง `ionic cordova run browser -l`

กำหนดให้ปุ่ม `ดึงข้อมูลจาก API` เรียก function เพื่อดึงข้อมูลจาก API และวาด map

```html
<button ion-button (click)="gotoPositionFromAPI($event)">
  ดึงข้อมูลจาก API
</button>
```

สร้าง function `gotoPositionFromAPI` เพื่อดึงตำแหน่งจาก API และ move แผนที่ไปตำแหน่งนั้น

```js
gotoPositionFromAPI() {
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.open(
    "GET",
    "http://www.zp11107.tld.122.155.17.167.no-domain.name/googlemaps-demo/fetch-position.php",
    false
  ); // false for synchronous request
  xmlHttp.send(null);

  const responseText = xmlHttp.responseText;
  const jsonData = JSON.parse(responseText);

  this.map.clear();

  this.map.addMarker({
    title: `Click lat = ${jsonData.lat} lng = ${jsonData.lng}`,
    icon: 'red',
    position: {
      lat: jsonData.lat,
      lng: jsonData.lng
    },
    snippet: 'click to save'
  })
  .then( marker => {
    this.map.animateCamera({
      target: jsonData,
      zoom: 18,
      duration: 1000
    })

    marker.on( GoogleMapsEvent.INFO_CLICK ).subscribe( () => {
      console.log('INFO_CLICK')
      console.log(jsonData)
      this.savePosition(jsonData.lat, jsonData.lng)
    })
  })
}
```

สร้าง function `savePosition` เพื่อส่งข้อมูลไปบันทึกที่ Database

```js
savePosition(lat, lng) {
  let formData = new FormData();
  formData.append("lat", lat);
  formData.append("lng", lng);

  var xhr = new XMLHttpRequest();
  xhr.open(
    "POST",
    "http://www.zp11107.tld.122.155.17.167.no-domain.name/googlemaps-demo/save-position.php",
    true
  );

  xhr.onload = function () {
    // do something to response
    // console.log(this.responseText);
    const response = JSON.parse(this.responseText);
    console.log(response);
  };
  xhr.send(formData);
}
```

## Build Android

ก่อนอื่นจะต้อง set path ตามนี้ (ตัวอย่าง set ใน iOS)

```sh
vi ~/.bash_profile
```

แล้วเพิ่ม path ต่าง ๆ ตามด้านล่าง

> JAVA_HOME

> ANDROID_HOME

```sh
# Create a JAVA_HOME variable, determined dynamically
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_181.jdk/Contents/Home
# Add that to the global PATH variable
export PATH=${JAVA_HOME}/bin:$PATH
# Set Android_HOME
export ANDROID_HOME=~/Library/Android/sdk/
# Add the Android SDK to the ANDROID_HOME variable
export PATH=$ANDROID_HOME/platform-tools:$PATH
export PATH=$ANDROID_HOME/tools:$PATH
```

จากนั้นให้ทำการ apply คำสั่งที่เพิ่มไป โดย run `source ~/.bash_profile`

ก่อนจะ run บน android จะต้องมี android studio ก่อน

แล้วรันด้วยคำสั่ง `ionic cordova run android`
