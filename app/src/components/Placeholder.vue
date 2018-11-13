<template>
    <v-layout>
        <h1> placeholder : {{ name }} </h1>
    </v-layout>
</template>

<script>
export default {
    name: 'placeholder',
    props: {
        name: {
            type: String,
            required: true
        }
    }
};
</script>
