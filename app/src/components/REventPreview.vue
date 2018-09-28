<template>
    <v-list-tile :key="event.id" avatar ripple :to="{name: 'event', params: {'slug': event.id}}">
        <r-event-meta :event="event" isPreview="true"></r-event-meta>
        <v-list-tile-content>
            <v-list-tile-title> {{event.metadata.name}} </v-list-tile-title>
            <v-chip small outline color="primary"> {{event.metadata.event_status}} </v-chip>
            <v-list-tile-sub-title> {{event.metadata.description}} </v-list-tile-sub-title>
        </v-list-tile-content>
    </v-list-tile>
</template>

<script>
import REventMeta from '@/components/EventMeta';

export default {
    name: 'REventPreview',
    props: {
        event: {type: Object, required: true}
    },
    components: {
        REventMeta
    }
};
</script>
