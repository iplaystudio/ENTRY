/*
以二维数组的方法来做
就相当于
010000
011000
012100
013310
014641
显然每个数相当于上一行正上方加上左上方的和
即dp[i][j]=dp[i-1][j]+dp[i-1][j-1]
****1
***1 1
**1 2 1
*1 3 3 1
1 4 6 4 1
根据观察发现每行前面的空格数为最后一行的行数减去当前行数
所以每行前面打印a-i个空格
*/
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