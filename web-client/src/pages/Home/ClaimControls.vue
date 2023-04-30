<script setup>
import Alert from '../../components/ui/Alert.vue'
import Button from '../../components/ui/Button.vue'
import InsufficientFundsModal from '../../components/InsufficientFundsModal'
import ShareModal from '../../components/ShareModal'
import useAvatarContract from './useAvatarContract'
import { computed, inject, ref, triggerRef, watch } from 'vue'
import { PIXEL_AVATAR_NETWORK } from '../../constants'
import Spinner from '../../components/ui/Spinner'

const CLAIMING_STATES = Object.freeze({
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
})

// Declare a ref for the flattened image
const flattenedImage = ref('')

const client = inject('web3client')
const previewState = inject('previewState')
const avatarContract = useAvatarContract()

const claimState = ref(CLAIMING_STATES.IDLE)
const errorMessage = ref(null)
const mintPriceEther = ref(null)
const showModal = ref(null)

async function startClaiming() {
    try {
        // Flatten the image in the viewbox to an SVG file
        await flattenImage()

        claimState.value = CLAIMING_STATES.LOADING

        await avatarContract.mint()

        claimState.value = CLAIMING_STATES.SUCCESS
        errorMessage.value = null
        showModal.value = null

        // Trigger a "developer changed" event to force refresh of owner in preview
        triggerRef(previewState.developer)

        // Show share modal
        showModal.value = 'share'
    } catch (error) {
        claimState.value = CLAIMING_STATES.ERROR
        errorMessage.value = error.message

        if (errorMessage.value.includes('insufficient funds')) {
            errorMessage.value = 'Insufficient funds in wallet.'
            showModal.value = 'insufficient_funds'
        }
    }
}

// Function to flatten the image in the viewbox to an SVG file
    async function flattenImage() {
        const svgElement = document.getElementById('frame');
        const viewBox = svgElement.getAttribute('viewBox').split(' ');
        const width = parseInt(viewBox[2]);
        const height = parseInt(viewBox[3]);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        const images = svgElement.querySelectorAll('image');
        const promises = [];

        for (const image of images) {
            const href = image.getAttribute('href');
            const img = new Image();
            promises.push(new Promise((resolve, reject) => {
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve();
                };
                img.onerror = reject;
                img.src = href;
            }));

    await Promise.all(promises);

    const dataUrl = canvas.toDataURL('image/png');
    flattenedImage.value = dataUrl;
}

    Promise.all(promises).then(() => {
    const serializer = new XMLSerializer();
    const serialized = serializer.serializeToString(svgElement);
    const blob = new Blob([serialized], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flattened.svg';
    a.click();
    });
}

function closeModal() {
    showModal.value = null
}

// Load mint price when connected to wallet
watch(client.isConnected, async (isConnected) => {
    if (isConnected) {
        claimState.value = CLAIMING_STATES.IDLE
        errorMessage.value = null
        mintPriceEther.value = await avatarContract.getMintPriceInEther()
    }
})
</script>

<template>
    <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-200 ease-out"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
    >
        <div v-if="client.isConnected.value">
            <h3
                class="
                    text-sm
                    font-bold
                    text-gray-600
                    dark:text-gray-300
                    uppercase
                    tracking-2
                "
            >
                YOUR DMMYWORLD NFT
            </h3>

            <p class="mt-2 text-gray-600 dark:text-gray-300 text-sm">
                Mint your DMMYWORLD NFT by connecting your wallet and clicking Claim DMMY
                <br />
            </p>

            <Alert v-if="errorMessage" class="mt-3" style="overflow-wrap: anywhere">
                Error: {{ errorMessage }}
            </Alert>
            <img :src="flattenedImage" style="width: 50%;" />
            <div class="mt-4 flex justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Mint price</span>
                <span class="flex items-center space-x-1">
                    <span v-if="mintPriceEther" v-text="mintPriceEther" />
                    <span v-else class="h-1 w-40 bg-blue-100 rounded-lg" />
                    <span v-text="PIXEL_AVATAR_NETWORK.currencySymbol" />
                </span>
            </div>

            <div class="mt-5 flex items-center justify-end">
                <Spinner
                    v-if="claimState === CLAIMING_STATES.LOADING"
                    class="w-4 h-4 mr-4"
                />

                <Button
                    class="w-full max-w-[12rem]"
                    :disabled="claimState === CLAIMING_STATES.LOADING"
                    @click="startClaiming()"
                >
                    <span v-if="claimState === CLAIMING_STATES.LOADING">
                        Claiming...
                    </span>
                    <span v-else>Claim DMMY</span>
                </Button>
            </div>

            <InsufficientFundsModal
                :show="showModal === 'insufficient_funds'"
                @close="closeModal()"
            />
            <ShareModal
                :show="showModal === 'share'"
                confetti="true"
                @close="closeModal()"
            />
        </div>
    </transition>
</template>