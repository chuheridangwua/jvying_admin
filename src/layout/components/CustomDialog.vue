<template>
    <transition name="fade">
        <div class="custom-dialog-mask" v-if="visible">
            <div class="custom-dialog" :style="{ maxHeight: dialogMaxHeight }">
                <div class="custom-dialog-header">
                    <h2 style="margin: 0;">{{ title }}</h2>
                    <button class="close-button" @click="closeDialog">
                        <i class="el-icon-close"></i>
                    </button>
                </div>
                <div class="custom-dialog-content" ref="content">
                    <slot></slot>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: 'Dialog Title'
        }
    },
    data() {
        return {
            dialogMaxHeight: '' // Maximum height for the dialog
        };
    },
    mounted() {
        this.setMaxHeight();
    },
    watch: {
        visible() {
            this.$nextTick(() => {
                this.setMaxHeight();
            });
        }
    },
    methods: {
        closeDialog() {
            this.$emit('close');
        },
        setMaxHeight() {
            const dialog = this.$refs.content;
            if (dialog) {
                const windowHeight = window.innerHeight;
                this.dialogMaxHeight = `${windowHeight * 0.85}px`;
            }
        }
    }
};
</script>

<style scoped>
.custom-dialog-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    /* Add a higher z-index */
}

.custom-dialog {
    background-color: white;
    border-radius: 5px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    /* overflow: hidden; */
    /* Hide any content that overflows */
    z-index: 10000;
    /* Add a higher z-index */
}

.custom-dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.close-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    position: relative;
}

.close-icon {
    width: 20px;
    height: 20px;
    position: relative;
}

.close-icon::before,
.close-icon::after {
    content: '';
    position: absolute;
    width: 2px;
    height: 100%;
    background-color: black;
    top: 0;
    left: 50%;
}

.close-icon::before {
    transform: rotate(45deg);
}

.close-icon::after {
    transform: rotate(-45deg);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
