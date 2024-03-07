<template>
    <div v-if="visible" class="loading-overlay">
        <div class="loader"></div>
    </div>
</template>

<script>
export default {
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<style lang="scss">
$colors: hsla(337, 84%, 48%, 0.75), hsla(160, 50%, 48%, 0.75), hsla(190, 61%, 65%, 0.75), hsla(41, 82%, 52%, 0.75);
$size: 2.5em;
$thickness: 0.5em;
$lat: (
    $size - $thickness) / 2;
$offset: $lat - $thickness;

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.7
    );
display: flex;
justify-content: center;
align-items: center;
z-index: 9999;
}

.loader {
    position: relative;
    width: $size;
    height: $size;
    transform: rotate(165deg);

    &:before,
    &:after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        display: block;
        width: $thickness;
        height: $thickness;
        border-radius: $thickness / 2;
        transform: translate(-50%, -50%);
    }

    &:before {
        animation: before 2s infinite;
    }

    &:after {
        animation: after 2s infinite;
    }
}

@keyframes before {
    0% {
        width: $thickness;
        box-shadow: $lat (
            -$offset) nth($colors, 1),
            (-$lat) $offset nth($colors, 3
        );
}

35% {
    width: $size;
    box-shadow: 0 (-$offset) nth($colors, 1), 0 $offset nth($colors, 3);
}

70%,
100% {
    width: $thickness;
    box-shadow: (-$lat) (-$offset) nth($colors, 1), $lat $offset nth($colors, 3);
}
}

@keyframes after {
    0% {
        height: $thickness;
        box-shadow: $offset $lat nth($colors, 2), (-$offset) (-$lat) nth($colors, 4);
    }

    35% {
        height: $size;
        box-shadow: $offset 0 nth($colors, 2), (-$offset) 0 nth($colors, 4);
    }

    70%,
    100% {
        height: $thickness;
        box-shadow: $offset (
            -$lat) nth($colors, 2),
            (-$offset) $lat nth($colors, 4
        );
}
}
</style>
