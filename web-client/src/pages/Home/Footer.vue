<script setup>
import { ExternalLinkIcon } from '@heroicons/vue/outline'
</script>

<template>
    <section
        class="border-t-8 border-gray-200 dark:border-gray-700 dark:bg-gray-900"
    >
        <div
            class="
                max-2xl
                mx-auto
                py-8
                px-4
                sm:px-6
                lg:max-w-7xl lg:px-8
                flex
                justify-end
                items-center
                space-x-8
            "
        >
            <a
                href="https://dummy.finance/"
                class="flex items-center space-x-2"
                target="_blank"
            >
                <span>Dummy.Finance</span>
                <ExternalLinkIcon class="inline-block h-4 w-4" />
            </a>

            <a
                href="https://t.me/+9C9ZaasqAGBmOTUx"
                class="flex items-center space-x-2"
                target="_blank"
            >
                <span>Telegram</span>
                <ExternalLinkIcon class="inline-block h-4 w-4" />
            </a>

            <a
                href="https://twitter.com/DMMYworldNFT"
                class="flex items-center space-x-2"
                target="_blank"
            >
                <span>Twitter</span>
                <ExternalLinkIcon class="inline-block h-4 w-4" />
            </a>
        </div>
    </section>
</template>
