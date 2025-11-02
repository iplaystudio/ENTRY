#include <stdio.h>
typedef struct coupon
{
    int x;
    int y;
} coupon;

int main() {
    int n;
    scanf("%d", &n);
    int p;
    scanf("%d", &p);
    coupon c[n];
    for (int i = 0; i < n; i++) {
        scanf("%d-%d", &c[i].x, &c[i].y);
    }
    coupon max={0,0};
    for (int i = 0; i < n; i++) {
        if (c[i].x <= p && c[i].y > max.y) {
            max = c[i];
        }
    }
    if (max.y == 0) printf("nothing\n");
    else printf("%d\n", p - max.y);
    return 0;
}