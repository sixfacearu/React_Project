class logic{
    boolean fun(String a){
        boolean arr[]=new boolean[256];
        for(int i=0;i<a.length();i++){
            int val=(int)a.charAt(i);
            if(arr[val]){
                return false;
            }
            else{
                arr[val]=true;
            }
            
        }
        return true;
    }
    public static void main(String args[]){
        logic obj=new logic();
        System.out.print(obj.fun("si1xface1"));
    }
}