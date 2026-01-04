self.addEventListener('push', function (event) {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'New Poke!';
    const options = {
        body: data.body || 'Someone poked you.',
        icon: '/icon-192x192.png', // Ensure this icon exists or use a placeholder
        badge: '/icon-192x192.png',
        data: {
            url: self.location.origin
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
