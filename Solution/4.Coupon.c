/*
这个题目就是简单的线性扫描
然后找出符合条件的最大的优惠券
其实有个更棒的方法：
定义一个数x，作为门槛
定义一个数组y,作为符合条件的优惠卷
max存取最大优惠卷
代码如下

#include <stdio.h>
int main() {
    long long n;
    scanf("%lld", &n);
    long long p;
    scanf("%lld", &p);
    long long x,y;
    for (int i = 0; i < n; i++) {
        scanf("%lld-%lld", &x, &y);
        if (x <= p && y > max) {
            max = y;
        }
    }
    printf("%lld\n", p - max);
    return 0;
}
*/
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