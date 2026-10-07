import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
export async function POST(req:Request){
 try{
  const {items,customer_name,shipping_address}=await req.json();
  const auth=req.headers.get("authorization");
  if(!auth?.startsWith("Bearer "))return NextResponse.json({error:"Sign in required."},{status:401});
  const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{global:{headers:{Authorization:auth}}});
  const {data:{user},error:ue}=await supabase.auth.getUser();
  if(ue||!user)return NextResponse.json({error:"Invalid session."},{status:401});
  if(!Array.isArray(items)||!items.length)return NextResponse.json({error:"Cart is empty."},{status:400});
  const ids=items.map((x:any)=>x.id);
  const {data:products,error:pe}=await supabase.from("products").select("id,name,price,supplier_price,stock,active").in("id",ids).eq("active",true);
  if(pe)return NextResponse.json({error:pe.message},{status:400});
  const map=new Map((products||[]).map(p=>[p.id,p]));
  const orderItems:any[]=[];
  let total=0;
  for(const item of items){const p=map.get(item.id);const qty=Number(item.qty);if(!p||!Number.isInteger(qty)||qty<1||qty>99||qty>p.stock)return NextResponse.json({error:"A product is unavailable or quantity is invalid."},{status:400});total+=Number(p.price)*qty;orderItems.push({product_id:p.id,product_name:p.name,quantity:qty,unit_price:p.price,supplier_price:p.supplier_price});}
  if(!customer_name||!shipping_address)return NextResponse.json({error:"Customer name and shipping address are required."},{status:400});
  const {data:order,error:oe}=await supabase.from("orders").insert({user_id:user.id,status:"pending",customer_name,customer_email:user.email,shipping_address,total}).select("id,total,status").single();
  if(oe)return NextResponse.json({error:oe.message},{status:400});
  const {error:ie}=await supabase.from("order_items").insert(orderItems.map(x=>({...x,order_id:order.id})));
  if(ie)return NextResponse.json({error:ie.message},{status:400});
  return NextResponse.json({order});
 }catch{return NextResponse.json({error:"Invalid checkout request."},{status:400})}
}