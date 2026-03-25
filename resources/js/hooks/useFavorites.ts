import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import favorites from '@/routes/favorites';

export function useFavorites() {
    const { props } = usePage();

    // Récupération des IDs partagés par le middleware Laravel
    const favoriteIds = new Set((props.favorite_ids as string[]) || []);

    const toggle = (property: any) => {
        router.post(
            favorites.toggle(),
            {
                property_id: String(property.id),
                property_title: property.title,
                property_image: property.image,
                property_location: property.location,
                property_price: property.price,
                property_rating: property.rating,
                property_type: property.type,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    const isNowFav = !favoriteIds.has(String(property.id));

                    if (isNowFav) {
                        toast.success('Ajouté aux favoris ❤️');
                    } else {
                        toast.info('Retiré des favoris');
                    }
                },
                onError: () =>
                    toast.error('Action impossible. Vérifiez votre connexion.'),
            },
        );
    };

    const isFavorite = (propertyId: string | number) =>
        favoriteIds.has(String(propertyId));

    return { isFavorite, toggle };
}
