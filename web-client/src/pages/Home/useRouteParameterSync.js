import { watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default function useRouteParameterSync(previewState) {
    const route = useRoute()
    const router = useRouter()

    onMounted(() => {
        if (route.query.dmmyId) {
            previewState.developer.value = route.query.dmmyId
            previewState.updateTraits()
        }
    })

    watch(previewState.developer, (developer) => {
        router.push({
            path: '/',
            query: {
                ...route.query,

                dmmyId: developer,
            },
        })
    })
}
