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