import { usePage, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import {
    Bell,
    BedDouble,
    CheckCheck,
    Trash2,
    CalendarCheck,
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

// Types adaptés à ce que Laravel enverra
interface HostNotification {
    id: string;
    title: string;
    description: string;
    total: number;
    guestCount: number;
    read: boolean;
    createdAt: string | Date;
}

function useOnClickOutside(
    ref: React.RefObject<HTMLElement>,
    handler: () => void,
) {
    useEffect(() => {
        const listener = (e: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(e.target as Node)) return;
            handler();
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
}

function NotifItem({
    notif,
    locale,
}: {
    notif: HostNotification;
    locale: string;
}) {
    const { __ } = useTranslation();
    // Sélection de la locale date-fns
    const dateLocale = locale === 'fr' ? fr : enUS;

    const handleMarkAsRead = () => {
        if (!notif.read) {
            router.post(
                route('notifications.read', { id: notif.id }),
                {},
                { preserveScroll: true },
            );
        }
    };

    return (
        <button
            onClick={handleMarkAsRead}
            className={cn(
                'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60',
                !notif.read && 'bg-primary/5',
            )}
        >
            <div className="bg-gradient-brand mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                <BedDouble className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="font-body truncate text-sm font-semibold text-foreground">
                        {notif.title}
                    </p>
                    {!notif.read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                </div>
                <p className="font-body mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {notif.description}
                </p>
                <div className="mt-1.5 flex items-center gap-3">
                    <span className="font-body text-xs font-semibold text-primary">
                        {new Intl.NumberFormat(
                            locale === 'fr' ? 'fr-FR' : 'en-US',
                            { style: 'currency', currency: 'EUR' },
                        ).format(notif.total)}
                    </span>
                    <span className="font-body flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarCheck className="h-3 w-3" />
                        {notif.guestCount} {__('notifications.guests')}
                    </span>
                </div>
                <p className="font-body mt-1 text-xs text-muted-foreground/60">
                    {format(new Date(notif.createdAt), 'HH:mm · d MMM', {
                        locale: dateLocale,
                    })}
                </p>
            </div>
        </button>
    );
}

export default function NotificationBell({
    className,
}: {
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Récupération via Inertia (Partagé dans HandleInertiaRequests)
    const { auth, locale }: any = usePage().props;
    const { __ } = useTranslation();

    const notifications: HostNotification[] = auth.notifications || [];
    const unreadCount = notifications.filter((n) => !n.read).length;

    useOnClickOutside(ref, () => setOpen(false));

    const markAllRead = () => {
        router.post(
            route('notifications.readAll'),
            {},
            { preserveScroll: true },
        );
    };

    const dismissAll = () => {
        router.delete(route('notifications.clear'), { preserveScroll: true });
    };

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    'relative flex h-9 w-9 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80',
                    className,
                )}
            >
                <Bell className="h-4 w-4 text-muted-foreground" />
                {unreadCount > 0 && (
                    <span className="font-body absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] animate-bounce items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="shadow-hero animate-fade-in absolute top-11 right-0 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-primary" />
                            <h3 className="font-display text-sm font-bold text-foreground">
                                {__('notifications.title')}
                            </h3>
                            {notifications.length > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="font-body h-5 px-1.5 text-xs"
                                >
                                    {notifications.length}
                                </Badge>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={markAllRead}
                                >
                                    <CheckCheck className="mr-1 h-3 w-3" />{' '}
                                    {__('notifications.mark_read')}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs hover:text-destructive"
                                    onClick={dismissAll}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="max-h-80 divide-y divide-border overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                                <Bell className="h-8 w-8 text-muted-foreground/30" />
                                <p className="text-sm font-medium">
                                    {__('notifications.empty')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {__('notifications.empty_desc')}
                                </p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <NotifItem
                                    key={notif.id}
                                    notif={notif}
                                    locale={locale}
                                />
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="border-t border-border bg-muted/20 px-4 py-2">
                            <p className="text-center text-[10px] text-muted-foreground">
                                {__('notifications.footer_note')}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
