#include <stdio.h>
#include <string.h>

int expandAroundCenter(char* s, int left, int right, int n) {
    while (left >= 0 && right < n && s[left] == s[right]) {
        left--;
        right++;
    }
    return right - left - 1;
}

int main() {
    char a[10000];
    fgets(a, sizeof(a), stdin);
    int len = strlen(a);
    if (len > 0 && a[len-1] == '\n') {
        a[len-1] = '\0';
        len--;
    }
    int n = len;
    if (n == 0) return 0;

    int start = 0, maxLen = 1;
    for (int i = 0; i < n; i++) {
        int len1 = expandAroundCenter(a, i, i, n);
        int len2 = expandAroundCenter(a, i, i+1, n);
        int len = len1 > len2 ? len1 : len2;
        if (len > maxLen) {
            maxLen = len;
            start = i - (len - 1) / 2;
        }
    }
    for (int i = start; i < start + maxLen; i++) {
        printf("%c", a[i]);
    }
    printf("\n");
    return 0;
}