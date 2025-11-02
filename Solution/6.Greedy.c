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