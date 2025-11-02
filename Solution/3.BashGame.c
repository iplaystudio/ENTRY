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