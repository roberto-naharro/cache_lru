# Cache LRU

Create a function which implements a Least Recently Used cache of a given size.

## Input description

The input is a file with this schema:
```bash
<size_of_cache>
Element_access_1
Element_access_2
Element_access_3
...
```
The first line indicates the length of the cache.
The next lines are memory element requests.

## Output description

The output is a file with the final elements inside the cache.

## Example

`$ cache_lru input.txt output.txt`

input.txt
```
3
A
B
B
A
C
C
D
A
```

output.txt
```
A
C
D
```
(the order is important)