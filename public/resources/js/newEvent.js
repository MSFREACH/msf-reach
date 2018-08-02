var newVm = new Vue(){
  el: "#newEventVue",
  data: {
    statuses: statuses,
    eventTypes: eventTypes,
    checkedTypes: [],
    checkedSubTypes: []
  },

  mounted: function(){
    console.log('new event modal moounted')


  },
  methods: {
    submitCreateEventData(){

    }
  }
}
