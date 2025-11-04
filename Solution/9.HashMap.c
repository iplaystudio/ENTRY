/*
其实可以直接用qsort函数来排序字符数组t，从而得到排序后的字符串，如下所示：
qsort(t, len, sizeof(char),(int(*)(const void*, const void*))strcmp);
这样性能就高很多了
这个是哈希表的简单实现
思路是把每个单词的字母排序后作为key，原始单词的索引作为value存储在结构体数组中
indexof函数用于查找key是否存在
若不存在则新建一个结构体存储该key及其对应的单词索引
若存在则将该单词索引追加到对应结构体的value数组中
最后输出结构体数组中的内容即可
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
typedef struct hm
{
    char k[101];
    int v[10000];
    int vindex;
}hm;
int kindex = 0;
int indexof(char k[], struct hm mp[], int m)
{
    for (int i = 0; i < m; i++)
    {
        if (strcmp(mp[i].k, k) == 0)
            return i;
    }
    return -1;
}
 
hm mp[10000];      
char s[10001][101]; 
 
int main()
{
    int n = 0;
    scanf("%d", &n);
    for (int i = 0; i < n; i++)
    {
        scanf("%s", s[i]); 
        
        char t[101];
        strcpy(t, s[i]);
        
        for (int j = 0; j < strlen(t); j++)
            for (int k = j + 1; k < strlen(t); k++)
                if (t[k] > t[j]) 
                {
                    char c = t[k];
                    t[k] = t[j];
                    t[j] = c;
                }
        if (indexof(t, mp, kindex) == -1)
        {
            strcpy(mp[kindex].k, t);           
            mp[kindex].v[mp[kindex].vindex++] = i;  
            kindex++;
        }
        else  
        {
            int idx = indexof(t, mp, kindex);
            mp[idx].v[mp[idx].vindex] = i;    
            mp[idx].vindex++;
        }
    }
    
    printf("%d\n", kindex); 
    for (int i = 0; i < kindex; i++)
    {
        for (int j = 0; j < mp[i].vindex; j++)
        {
            printf("%s", s[mp[i].v[j]]); 
            if (j != mp[i].vindex - 1)
                printf(" ");  
        }
        printf("\n");
    }
    return 0;
}