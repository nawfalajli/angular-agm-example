import { Component, OnInit } from "@angular/core";
declare const google: any;

@Component({
  selector: "app-agm-example",
  templateUrl: "./agm-example.component.html",
  styleUrls: ["./agm-example.component.css"],
})
export class AgmExampleComponent implements OnInit {
  lat = 30.419017267116974;
  lng = -9.592411350637821;
  pointList: { lat: number; lng: number }[] = [];
  drawingManager: any;
  selectedShape: any;
  selectedArea = 0;

  constructor() {}

  ngOnInit() {
    this.setCurrentPosition();
  }

  onMapReady(map) {
    this.initDrawingManager(map);
  }

  pathArray = null;
  centerpoint = null;
  centerpointArr = null;
  getres = false;
  drawType = null;
  initDrawingManager = (map: any) => {
    const self = this;
    const options = {
      drawingControl: true,
      drawingControlOptions: {
        drawingModes: ["polygon", "rectangle", "circle", "polyline"],
      },
      polygonOptions: {
        fillColor: "#ffffff",
        strokeColor: "#ffffff",
        fillOpacity: 0.4,
        strokeWeight: 1.6,   
        clickable: true,
        editable: true,
        draggable: false,
        zIndex: 1,
      },
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
    };
    this.drawingManager = new google.maps.drawing.DrawingManager(options);
    this.drawingManager.setMap(map);
    google.maps.event.addListener(
      this.drawingManager,
      "overlaycomplete",
      (event) => {
        this.drawType = event.type;
        console.log("drawType", this.drawType);

        //draw POLYGON
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
          this.getres = true;
          const paths = event.overlay.getPaths();
          this.pathArray = JSON.stringify(
            event.overlay.getPath().getArray(),
            undefined,
            2
          );
          for (let p = 0; p < paths.getLength(); p++) {
            google.maps.event.addListener(paths.getAt(p), "set_at", () => {
              if (!event.overlay.drag) {
                self.updatePointList(event.overlay.getPath());
              }
            });
            google.maps.event.addListener(paths.getAt(p), "insert_at", () => {
              self.updatePointList(event.overlay.getPath());
            });
            google.maps.event.addListener(paths.getAt(p), "remove_at", () => {
              self.updatePointList(event.overlay.getPath());
            });
          }
          self.updatePointList(event.overlay.getPath());
          this.centerpoint = JSON.stringify(
            self.Calculatepolygoncenter(event.overlay.getPath().getArray())
          );
          this.centerpointArr = self.Calculatepolygoncenter(
            event.overlay.getPath().getArray()
          );
          this.selectedShape = event.overlay;
          this.selectedShape.type = event.type;
          this.drawingManager.setOptions({
            drawingControl: false,
            drawingMode: null,
          });
        }

        //draw RECTANGLE
        if (event.type === google.maps.drawing.OverlayType.RECTANGLE) {
          this.getres = true;
          let bounds = event.overlay.getBounds();

          let NorthWest: any = [
            bounds.getNorthEast().lat(),
            bounds.getSouthWest().lng(),
          ];
          let SouthEst: any = [
            bounds.getSouthWest().lat(),
            bounds.getNorthEast().lng(),
          ];
          this.centerpointArr = {
            lat:
              (bounds.getNorthEast().lat() + bounds.getSouthWest().lat()) / 2,
            lng:
              (bounds.getSouthWest().lng() + bounds.getNorthEast().lng()) / 2,
          };

          this.pointList = [
            {
              lat: bounds.getNorthEast().lat(),
              lng: bounds.getSouthWest().lng(),
            },
            {
              lat: bounds.getSouthWest().lat(),
              lng: bounds.getNorthEast().lng(),
            },
          ];

          this.centerpoint = JSON.stringify(this.centerpointArr);

          this.pathArray = JSON.stringify(
            {
              NorthWest: {
                lat: bounds.getNorthEast().lat(),
                lng: bounds.getSouthWest().lng(),
              },
              SouthEst: {
                lat: bounds.getSouthWest().lat(),
                lng: bounds.getNorthEast().lng(),
              },
            },
            undefined,
            2
          );

          this.getres = true;

          this.selectedShape = event.overlay;
          this.selectedShape.type = event.type;
          this.drawingManager.setOptions({
            drawingControl: false,
            drawingMode: null,
          });
        }

        //draw CIRCLE
        if (event.type === google.maps.drawing.OverlayType.CIRCLE) {
          let lat = event.overlay.getCenter().lat();
          let lng = event.overlay.getCenter().lng();

          this.centerpointArr = {
            lat: event.overlay.getCenter().lat(),
            lng: event.overlay.getCenter().lng(),
          };

          this.pointList = [
            {
              lat: event.overlay.getCenter().lat(),
              lng: event.overlay.getCenter().lng(),
            },
          ];

          this.centerpoint = JSON.stringify(this.centerpointArr);

          this.pathArray = JSON.stringify(
            {
              lat: event.overlay.getCenter().lat(),
              lng: event.overlay.getCenter().lng(),
              radius: event.overlay.getRadius(),
            },
            undefined,
            2
          );

          this.getres = true;

          this.getres = true;

          this.selectedShape = event.overlay;
          this.selectedShape.type = event.type;
          this.drawingManager.setOptions({
            drawingControl: false,
            drawingMode: null,
          });
        }

        //draw POLYLINE
        if (event.type === google.maps.drawing.OverlayType.POLYLINE) {
          this.pathArray = JSON.stringify(
            event.overlay.getPath().getArray(),
            undefined,
            2
          );
          self.updatePointList(event.overlay.getPath());
          this.centerpoint = JSON.stringify(
            self.CalculatePolylinecenter(event.overlay.getPath().getArray())
          );
          this.centerpointArr = self.CalculatePolylinecenter(
            event.overlay.getPath().getArray()
          );

          this.getres = true;

          this.selectedShape = event.overlay;
          this.selectedShape.type = event.type;
          this.drawingManager.setOptions({
            drawingControl: false,
            drawingMode: null,
          });
        }

        /*if (event.type !== google.maps.drawing.OverlayType.MARKER) {
          // Switch back to non-drawing mode after drawing a shape.
          self.drawingManager.setDrawingMode(null);
          // To hide:
          self.drawingManager.setOptions({
            drawingControl: false,
          });
        }*/
      }
    );
  };
  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });
    }
  }

  Calculatepolygoncenter(CoordArray) {
    // CoordArray =  get 'event.overlay.getPath().getArray()' when overlaycomplete
    var bounds = new google.maps.LatLngBounds();
    let polygonCoords = [];
    // The Bermuda Triangle
    for (let index = 0; index < CoordArray.length; index++) {
      polygonCoords.push(new google.maps.LatLng(CoordArray[index]));
    }
    for (let i = 0; i < polygonCoords.length; i++) {
      bounds.extend(polygonCoords[i]);
    }
    return { lat: bounds.getCenter().lat(), lng: bounds.getCenter().lng() };
  }

  CalculatePolylinecenter(CoordArray) {
    console.log(CoordArray);

    if (CoordArray.length > 0)
      return { lat: CoordArray[1].lat(), lng: CoordArray[1].lng() };
    return {};
  }

  deleteSelectedShape() {
    this.getres = false;
    this.drawType = null;
    this.pathArray = null;
    this.centerpoint = null;
    if (this.selectedShape) {
      this.selectedShape.setMap(null);
      this.selectedArea = 0;
      this.pointList = [];
      // To show:
      this.drawingManager.setOptions({
        drawingControl: true,
      });
    }
  }

  updatePointList(path) {
    this.pointList = [];
    const len = path.getLength();
    for (let i = 0; i < len; i++) {
      this.pointList.push(path.getAt(i).toJSON());
    }
    this.selectedArea = google.maps.geometry.spherical.computeArea(path);
  }
}
