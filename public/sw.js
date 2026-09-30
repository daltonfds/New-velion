self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: "Newvelion",
      body: event.data
        ? event.data.text()
        : "You have a new notification.",
    };
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || "Newvelion",
      {
        body:
          data.body ||
          "You have a new notification.",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: {
          url:
            data.url ||
            "/dashboard/seller",
        },
      },
    ),
  );
});

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const url =
      event.notification?.data?.url ||
      "/dashboard/seller";

    event.waitUntil(
      clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      }).then((list) => {
        for (const client of list) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }

        return undefined;
      }),
    );
  },
);
