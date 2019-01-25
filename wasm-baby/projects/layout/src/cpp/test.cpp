/*
 * Copyright 2011 The Emscripten Authors.  All rights reserved.
 * Emscripten is available under two separate licenses, the MIT license and the
 * University of Illinois/NCSA Open Source License.  Both these licenses can be
 * found in the LICENSE file.
 */

#include <stdio.h>
#include <stdlib.h>
#include <vector>
#include <emscripten/emscripten.h>

EMSCRIPTEN_KEEPALIVE double power(double x, double y) {
    std::vector<double> doubles;
    doubles.push_back(x);
    doubles.push_back(y);

    return doubles[0];
}

int main()
{
    printf("hello, world!\n");
    return 0;
}
