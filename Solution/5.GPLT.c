/*
这题其实就是把iplay存起来然后按序输出。
分别定义I,P,L,A,Y五个数组存储对应的字母和对应的数量，然后按顺序输出即可。
*/
# include <stdio.h>
int main() 
{
    int n;
    scanf("%d", &n);
    getchar(); 
    
    char str[100005];
    fgets(str, sizeof(str), stdin);
    
    char I[100005], P[100005], L[100005], A[100005], Y[100005];
    int countI = 0, countP = 0, countL = 0, countA = 0, countY = 0;
    
    for (int i = 0; str[i] != '\0' && str[i] != '\n'; i++) {
        if (str[i] == 'I' || str[i] == 'i') {
            I[countI++] = str[i];
        } else if (str[i] == 'P' || str[i] == 'p') {
            P[countP++] = str[i];
        } else if (str[i] == 'L' || str[i] == 'l') {
            L[countL++] = str[i];
        } else if (str[i] == 'A' || str[i] == 'a') {
            A[countA++] = str[i];
        } else if (str[i] == 'Y' || str[i] == 'y') {
            Y[countY++] = str[i];
        }
    }
    
    int idxI = 0, idxP = 0, idxL = 0, idxA = 0, idxY = 0;
    while (idxI < countI || idxP < countP || idxL < countL || idxA < countA || idxY < countY) {
        if (idxI < countI) {
            putchar(I[idxI++]);
        }
        if (idxP < countP) {
            putchar(P[idxP++]);
        }
        if (idxL < countL) {
            putchar(L[idxL++]);
        }
        if (idxA < countA) {
            putchar(A[idxA++]);
        }
        if (idxY < countY) {
            putchar(Y[idxY++]);
        }
    }
    putchar('\n');
    
    return 0;
}