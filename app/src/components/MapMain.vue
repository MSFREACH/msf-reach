<template>
    <v-layout row wrap app>
        <v-btn id="filterMenu" @click.stop="drawer = !drawer"><v-icon>menu</v-icon></v-btn>
        <v-card class="d-inline-block elevation-12">
            <v-navigation-drawer v-model="drawer" floating app id="filterBar">
                <v-list>
                    <v-list-group v-for="(item, i) in filterItems" append-icon="add" :key="i" no-action>
                        <v-list-tile slot="activator">
                            <v-list-tile-action>
                                <img class="menu-icon" :src="'/resources/new_icons/menu_'+item.value+'.svg'">
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ item.label }}</v-list-tile-title>
                            </v-list-tile-content>
                            <v-list-tile-action>
                                <v-checkbox v-model="checkedSections[item.value]"></v-checkbox>
                            </v-list-tile-action>
                        </v-list-tile>
                        <v-list-tile v-for="(subItem, i) in item.subItems" :key="i+'i'">
                            <v-list-tile-action>
                                <img class="menu-icon" :src="'/resources/new_icons/menu_'+item.value+'_'+subItem.value+'.svg'">
                            </v-list-tile-action>
                            <v-list-tile-title v-text="subItem.label"></v-list-tile-title>
                            <v-list-tile-action>
                                <v-checkbox v-model="checkedFilters[item.value][i]" :value="subItem.value"></v-checkbox>
                            </v-list-tile-action>
                        </v-list-tile>

                    </v-list-group>
                </v-list>
            </v-navigation-drawer>
        </v-card>
        <div id="map" class="map"></div>
        <v-layout class="mode-docker">
            <v-flex xs12 sm6 class="py-2">
                <p>Map mode</p>
                <v-btn-toggle v-model="toggle_mode" mandatory>
                  <v-btn flat value="thematic">
                    <v-icon>invert_colors</v-icon>
                  </v-btn>
                  <v-btn flat value="terrain">
                    <v-icon>terrain</v-icon>
                  </v-btn>
                  <v-btn flat value="satellite">
                    <v-icon>satellite</v-icon>
                  </v-btn>
                  <v-btn flat value="humanitarian">
                    <v-icon>accessibility_new</v-icon>
                  </v-btn>
                </v-btn-toggle>
              </v-flex>
          </v-layout>
    </v-layout>
</template>
<script>
/*eslint no-console: off*/
/*eslint no-unused-vars: off*/
/*eslint no-negated-condition: off*/
/*eslint no-debugger: off*/

import { mapGetters } from 'vuex';
import { MAPBOX_STYLES, MAP_FILTERS } from '@/common/map-fields';
import { STATUS_ICONS } from '@/common/map-icons';
import { FETCH_EVENTS } from '@/store/actions.type';
import { getFeatures } from '@/lib/geojson-util';
import { EVENT_STATUSES } from '@/common/common';

var map;

export default {
    name: 'map-main',
    props: {
        coordinates: {
            type: Array
        },
        eventId: {
            type: String,
            required: false
        }
    },
    data(){
        return{
            drawer: null,
            eventFeatureCollection:[],
            recentCoordinates: [],
            toggle_mode: 1,
            selectedFilters: null,
            filterItems: MAP_FILTERS,
            layerIds: [],
            allStatuses: EVENT_STATUSES,
            checkedSections:{
                events: null,
                reports: null,
                contacts: null,
                rssFeeds: null
            },
            checkedFilters: {
                events: [],
                reports: [],
                contacts: [],
                rssFeeds: []
            }
        };
    },
    mounted(){
        this.fetchEvents();
    },
    watch: {
        coordinates(newVal){
            this.map.setView([newVal[0], newVal[1]], 7);
            this.map.invalidateSize();
        },
        eventsGeoJson(val){
            if(val){
                this.initMap();
                this.loadEventsLayer();
            }
        },
        toggle_mode(val){
            map.setStyle(MAPBOX_STYLES[val]);
        },
        checkedSections(val){
            console.log(" ------ [checked sections] ::: ", val);
        }
    },
    computed: {
        ...mapGetters([
            'eventsCount',
            'isLoadingEvent',
            'eventsGeoJson',
            'fetchEventsError'
        ])
    },
    methods: {
        fetchEvents() {
            this.$store.dispatch(FETCH_EVENTS, {});
        },
        initMap(){
            var geojsonEvents = this.eventsGeoJson.objects.output;
            var eventFeatureCollection = getFeatures(this.eventsGeoJson, 'output');

            if(this.eventId){
                var eventObj = eventFeatureCollection.filter(item =>{
                    return item.properties.id == this.eventId;
                });
                var gotoCoordinates = eventObj[0].geometry.coordinates;
                this.recentCoordinates = gotoCoordinates;
            }else if(!_.isEmpty(this.recentCoordinates)){
                var gotoCoordinates = this.recentCoordinates; // to not lose center when refreshing
            }else{
                var gotoCoordinates = geojsonEvents.geometries[0].coordinates;
            }

            map = new mapboxgl.Map({
                container: 'map',
                style: MAPBOX_STYLES.thematic,
                center: gotoCoordinates,
                zoom: 10,
                minZoom: 4
            });

            this.loadEventsLayer(eventFeatureCollection);
            this.appendEventsTooltip();
            map.on('zoom', function(e){
                console.log(map.getZoom());
            });
        },

        loadEventsLayer(){
            var vm = this;
            var featureCollection = getFeatures(this.eventsGeoJson, 'output');

            map.on('load', function () {
                vm.allStatuses.forEach(function(item){
                    var imageId = 'event-'+item.value;
                    var imageKey = `/resources/new_icons/event_${item.value}.png`;

                    map.loadImage(imageKey, function(error, image){
                        if(!map.hasImage(imageId)){
                            if(error) throw error;
                            map.addImage(imageId, image);
                        }
                    });
                })
                if(!map.getSource("reach-events")){
                    map.addSource("reach-events", {
                        type: "geojson",
                        data: {
                            "type": "FeatureCollection",
                            "features": featureCollection
                        },
                        cluster: true,
                        clusterMaxZoom: 14, // Max zoom to cluster points on
                        clusterRadius: 50
                    });
                }
                if(!map.getLayer("events-heat")){
                    map.addLayer({
                        "id": "events-heat",
                        "type": "heatmap",
                        "source": "reach-events",
                        "maxzoom": 9,
                        "paint": {
                            // Increase the heatmap weight based on frequency and property magnitude
                            "heatmap-weight": [
                                "interpolate",
                                ["linear"],
                                ["get", "point_count"],
                                0, 0,
                                10, 1
                            ],
                            // Increase the heatmap color weight weight by zoom level
                            // heatmap-intensity is a multiplier on top of heatmap-weight
                            "heatmap-intensity": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                0, 1,
                                9, 3
                            ],
                            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                            // Begin color ramp at 0-stop with a 0-transparancy color
                            // to create a blur-like effect.
                            "heatmap-color": [
                                "interpolate",
                                ["linear"],
                                ["heatmap-density"],
                                0, "rgba(207,210,218,.2)",
                                0.25, "rgba(154,186,213,.4)",
                                0.5, "rgba(104,163,208,.6)",
                                0.75, "rgba(56,140,204,.8)",
                                1, "rgba(3,116,199, 1)"
                            ],
                            // Adjust the heatmap radius by zoom level
                            "heatmap-radius": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                0, 2,
                                2, 76 // ADJUST FOR: blur radius
                            ],
                            // Transition from heatmap to circle layer by zoom level
                            "heatmap-opacity": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                7, 1,
                                9, 0
                            ],
                        }
                    });
                }
                if(!map.getLayer("events-epicenter")){
                    map.addLayer({
                        id: "events-epicenter",
                        type: "circle",
                        source: "reach-events",
                        minzoom: 7,
                        paint: {
                           "circle-color": [
                               "step",
                               ["get", "point_count"],
                               "rgba(3, 116, 199, .5)", // wine red , less than 5
                               5,
                               "rgba(3, 116, 199, .5)", // standard red, between 5 and 10
                               10,
                               "rgba(3, 116, 199, .5)" // bright red, greater than or equal to 10
                           ],
                           "circle-radius": [
                               "step",
                               ["get", "point_count"],
                               20,  // size, less than 5
                               5,
                               30,  // size between 5 and 10
                               20,
                               50  // size greater than or equal to 10
                           ]
                        },
                        "filter": ["==", "$type", "Point"],
                    });
                }
                featureCollection.forEach(function(feature){
                    var status = feature.properties.metadata.event_status.toLowerCase();
                    if(status=='assessment'){
                        var iconImage = 'event-ongoing';
                    }else{
                        var iconImage = "event-"+status;
                    }
                    var layerId = 'events_'+status;
                    if(!map.getLayer(layerId)){
                        map.addLayer({
                            id: layerId,
                            type: "symbol",
                            source: "reach-events",
                            minzoom: 10,
                            layout: {
                                "icon-image": iconImage,
                                "icon-allow-overlap": true
                            },
                            filter: ["==", "event_status", status]
                        });

                        vm.layerIds.push(layerId);
                    }
                });
                if(!map.getLayer("events-cluster-count")){
                    map.addLayer({
                        id: "events-cluster-count",
                        type: "symbol",
                        minzoom: 6,
                        source: "reach-events",
                        filter: ["has", "point_count"],
                        layout: {
                        "text-field": "{point_count_abbreviated}",
                        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                        "text-size": 12
                        }
                    });
                }

                if(!map.getLayer("events-unclustered-point")){
                    map.addLayer({
                        id: "events-unclustered-point",
                        type: "circle",
                        source: "reach-events",
                        minzoom: 7,
                        maxzoom: 10,
                        filter: ["!", ["has", "point_count"]],
                        paint: {
                            "circle-color": "rgba(3, 116, 199, .5)",
                            "circle-radius": 10,
                            "circle-stroke-width": 1,
                            "circle-stroke-color": "rgba(3, 116, 199, .5)"
                        }
                    });
                }
                // vm.layerIds.push("events-heat", "events-epicenter", )
            });
        },
        appendEventsTooltip(){
            // Create a popup, but don't add it to the map yet.
            var popup = new mapboxgl.Popup({
                closeButton: true,
                closeOnClick: false
            });

            map.on('mouseenter', 'events-epicenter', function(e) {
                // Change the cursor style as a UI indicator.
                map.getCanvas().style.cursor = 'pointer';
                var coordinates = e.features[0].geometry.coordinates.slice();

                var evMeta = JSON.parse(e.features[0].properties.metadata);
                var description = evMeta.description; // <<< missing feature.properties, need to convert GeometryCollection to FeatureCollection
                var evName = evMeta.name;
                // var evType = evMeta.types.join(',');
                var evStatus = evMeta.event_status;

                var cleanAreas = _.compact(evMeta.areas);
                var evPlace;
                if(!evMeta.areas || _.isEmpty(cleanAreas)){
                    evPlace = evMeta.country;
                }else{
                    if(cleanAreas[0].region){
                        evPlace = cleanAreas[0].region + cleanAreas[0].country_code;
                    }else{
                        evPlace = cleanAreas[0].country;
                    }
                }

                var evLastUpdate = e.features[0].properties.updated_at

                var contentStr = `<a href="#/events/${e.features[0].properties.id}">
                    <div class="primary-text">${evName}</div>
                    <div class="secondary-text">${evStatus} - \n ${evPlace} </div>
                    <label>${evLastUpdate} </label>
                    </a> `;

                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                // Populate the popup and set its coordinates
                // based on the feature found.
                popup.setLngLat(coordinates)
                    .setHTML(contentStr)
                    .addTo(map);
            });

             // map.on('mouseleave', 'events-epicenter', function() {
             //     map.getCanvas().style.cursor = '';
             //     popup.remove();
             // });
        },
        filterSections(){

        },
        filterSubcategory(main, sub){
            // **** expression for MAPBOX match filter ****
            // ['match', ['get', property], inputValue, outputValue if match, outputValue if not a match]
            console.log(main, sub);
        },
        zoomToEventCenter(){
            var eventObj = this.eventFeatureCollection.filter(item =>{
                return item.properties.id == this.eventId;
            });

            map.flyTo({center: [eventObj.geometry.coordinates]});
        }

    }

};

</script>

<style lang='scss'>
    #map{
        display: block;
        width: 100%;
        height: calc(100vh - 64px); // **height require by leaflet
    }

    .anchor-nav{
        z-index: 11;
        bottom: 12px;
    }

    .mapContainer{
        .leaflet-top, .leaflet-bottom {
            z-index: 5 !important;
        }
        .leaflet-pane {
            z-index: 10 !important;
        }
    }
    .menu-icon{
        height: 30px;
    }
    .mode-docker{
        position: absolute;
        bottom: 0;
        left: 0;
        margin: 30px;
    }
    #filterMenu{
        top: 90px;
        z-index: 8;
        min-width: 40px;
        padding: 0;
    }
    #filterBar{
        height: inherit !important;
        top: 140px;
        margin: 6px 8px;
        padding: 12px;
        background: #EEEEEE;
        border-radius: 5px;
        // .v-list__group__items--no-action .v-list__tile {
        //     padding-left: 36px;
        // }
    }
</style>
