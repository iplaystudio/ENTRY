/*
这是一个巴什博弈(自行百度)
当剩余 0 个石头时：对方已经赢了（我们是必败状态）
当剩余 1~n 个石头时：我们可以一次拿完，立即赢（必胜状态）
当剩余 n+1 个石头时：
如果我们拿 1 个，对方面对 n 个（对方必胜）
如果我们拿 2 个，对方面对 n-1 个（对方必胜）
...
如果我们拿 n 个，对方面对 1 个（对方必胜）
无论怎么拿，对方都必胜，所以这是必败状态
m % (n+1) == 0 时：m 是 (n+1) 的倍数
先手陷入必败状态 → 后手（Mortis）赢
m % (n+1) != 0 时：m 不是 (n+1) 的倍数
先手处于必胜状态，可以拿走 m%(n+1) 个石头，
让对方面对 (n+1) 的倍数 → 先手（Mutsumi）赢
*/
#include<stdio.h>

int main(){
    int t=0;
    scanf("%d",&t);
    for(int i=0;i<t;i++)
    {
        long long m=0,n=0;
        scanf("%lld %lld",&m,&n);
        if(m%(n+1)==0)
            printf("Mortis Plants BitterMelon\n");
        else
            printf("Mutsumi Plants Cucumber\n");
    }
    return 0;
}