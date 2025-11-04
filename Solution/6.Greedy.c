/*
这题结构体最好理解啊其实
贪心算法经典题目，鱼的单位重量价值排序然后装鱼
但是其实用三个数组同步冒泡也行
就是把 Fish f[n]; 换成三个数组 double w[n],p[n],u[n]; 然后同步冒泡排序
即
for(int i=0;i<n;i++)
    {
        for(int j=i+1;j<n;j++)
        {
            if(u[i]>u[j]) 
            {
                double tw=w[i],tp=p[i],tu=u[i];
                w[i]=w[j];p[i]=p[j];u[i]=u[j];
                w[j]=tw;p[j]=tp;u[j]=tu;
            }
        }
    }
然后从这里开始就和结构体版本一样了
即从单价最小的开始卖鱼,假设每个都全部买光
如果sum+p[i]<=m就全部买光
否则就买一部分然后把钱花光
*/
#include<stdio.h>
typedef struct Fish
{
    double w;
    double p;
    double u; 
} Fish;

int main()
{
    int n;
    double m;
    scanf("%d%lf",&n,&m);
    Fish f[n];
    double sum=0;
    double res=0;
    for(int i=0;i<n;i++)scanf("%lf%lf",&f[i].w,&f[i].p);
    for(int i=0;i<n;i++)f[i].u=f[i].p/f[i].w;  
    for(int i=0;i<n;i++)
    {
        for(int j=i+1;j<n;j++)
        {
            if(f[i].u>f[j].u) 
            {
                struct Fish t=f[i];
                f[i]=f[j];
                f[j]=t;
            }
        }
    }
    for(int i=0;i<n;i++)
    {
       if(sum+f[i].p<=m)
       {
           sum+=f[i].p;
           res+=f[i].w;
       }
       else
       {
           res+=(m-sum)/f[i].u;
           break;
       }
    }
    printf("%.2lf",res);
    return 0;
}