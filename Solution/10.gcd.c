/*
1. 定义gcd函数求最大公因数
连续做模运算，直到余数为0
此时除数就是最大公因数

2. 对于2到m范围内的每个数i
检查i是否与数组中所有元素互质
如果i与某个元素gcd不为1，说明它们有公因数，不互质
如果i与所有元素都互质（gcd都为1），则找到答案

3. 如果遍历完2到m都找不到，输出-1
*/
# include <stdio.h>

int gcd(int a, int b) {
    while(b) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

int main() {
    int n, m;
    scanf("%d %d", &n, &m);
    int c[105];
    for(int i=0;i<n;i++)
    {
        scanf("%d", &c[i]);
    }

    for(int i=2;i<=m;i++)
    {
        int flag=1; 
        for(int j=0;j<n;j++)
        {
            if(gcd(i, c[j]) != 1) 
            {
                flag=0;  
                break; 
            }
        }
        if(flag==1)
        {
            printf("%d\n", i);
            return 0;
        }
    }
    printf("-1\n");
    return 0;
}