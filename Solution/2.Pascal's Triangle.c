#include<stdio.h>
    long long dp[5000][5000]={0};
int main(){
    dp[0][1]=1;
    int a=0;
    scanf("%d",&a);
    for(int i=1;i<=a;i++)
    {
        for(int k=0;k<a-i;k++)
            printf("%c",' ');
        for(int j=1;j<=i;j++)
        {
            dp[i][j]=dp[i-1][j]+dp[i-1][j-1];
            if(j==i)
                printf("%lld",dp[i][j]);
            else
            printf("%lld ",dp[i][j]);
        }
        printf("\n");
    }
}