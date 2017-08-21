def BST(root):
  r = f(root.right)
  if root.right == None && root.left == None:
    sum = root.val  
    return sum
  root.val += r
  r = root.val
  l = f(root.left)
  return r


f(4)
  f(9)
    f(18)
      r = 18
  9 += 18;
  r = 27
  l = f(8)


  BST = f(8)
