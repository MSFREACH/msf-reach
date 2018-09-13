<template>
    <div class="landing-events">
        <REventList status="active" />
    </div>
</template>
<script>
import REventList from '@/components/EventList';

export default {
    name: 'r-landing-events',
    components: {
        REventList
    }
};
</script>
