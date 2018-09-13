<template>
    <div class="event-preview">
        <r-event-meta :event="event" isPreview="true"></r-event-meta>
        <router-link class="preview-link"
            :to="{name: 'event', params: {'slug': event.id}}">
            <h1> {{event.metadata.name}} </h1>
            <span> {{event.status}} </span>
            <p> {{event.metadata.description}}</p>
        </router-link>
    </div>
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
