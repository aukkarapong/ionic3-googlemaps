import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

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
  MyLocation
} from '@ionic-native/google-maps';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  map: GoogleMap;
  location: any;

  constructor(public navCtrl: NavController, private platform: Platform) {

  }

  ngAfterViewInit() {
    this.platform.ready().then(() => {
      this.loadMap();
    });
  }

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
            this.savePosition(data[0].lat, data[0].lng)
          })
        })

      })
    })
  }

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
            this.savePosition(location.latLng.lat, location.latLng.lng)
          });
        });
      });
  }

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

}
