import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";

export async function POST(req:Request){
 try{
  const {items,customer_name,shipping_address}=await req.json();
  const auth=req.headers.get("authorization");
  if(!auth?.startsWith("Bearer "))return NextResponse.json({error:"Sign in required."},{status:401});
  if(!process.env.FLW_SECRET_KEY)return NextResponse.json({error:"Payment is not configured on the server."},{status:503});
  const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{global:{headers:{Authorization:auth}}});
  const {data:{user},error:ue}=await supabase.auth.getUser();
  if(ue||!user)return NextResponse.json({error:"Invalid session."},{status:401});
  if(!Array.isArray(items)||!items.length||!customer_name||!shipping_address)return NextResponse.json({error:"Cart and delivery details are required."},{status:400});
  const ids=items.map((x:any)=>x.id);
  const {data:products,error:pe}=await supabase.from("products").select("id,name,price,supplier_price,stock,active").in("id",ids).eq("active",true);
  if(pe)return NextResponse.json({error:pe.message},{status:400});
  const map=new Map((products||[]).map(p=>[p.id,p])); let total=0; const orderItems:any[]=[];
  for(const item of items){
   const p=map.get(item.id); const qty=Number(item.qty);
   if(!p||!Number.isInteger(qty)||qty<1||qty>99||qty>p.stock)return NextResponse.json({error:"A product is unavailable or quantity is invalid."},{status:400});
   total+=Number(p.price)*qty;
   orderItems.push({product_id:p.id,product_name:p.name,quantity:qty,unit_price:p.price,supplier_price:p.supplier_price});
  }
  const reference="VEY-"+crypto.randomUUID().replaceAll("-","").slice(0,24);
  const order=await supabase.from("orders").insert({user_id:user.id,status:"pending",payment_status:"unpaid",payment_reference:reference,customer_name,customer_email:user.email,shipping_address,total}).select("id,total,status,payment_reference").single();
  if(order.error)return NextResponse.json({error:order.error.message},{status:400});
  const inserted=await supabase.from("order_items").insert(orderItems.map(x=>({...x,order_id:order.data.id})));
  if(inserted.error)return NextResponse.json({error:inserted.error.message},{status:400});
  const base=process.env.NEXT_PUBLIC_SITE_URL||new URL(req.url).origin;
  const response=await fetch("https://api.flutterwave.com/v3/payments",{
   method:"POST",
   headers:{"Authorization":`Bearer ${process.env.FLW_SECRET_KEY}`,"Content-Type":"application/json"},
   body:JSON.stringify({
    tx_ref:reference,amount:Math.round(total),currency:"NGN",
    redirect_url:`${base}/payment/callback`,
    customer:{email:user.email,name:customer_name},
    customizations:{title:"Veylola Shop",description:"Veylola Shop order payment"}
   })
  });
  const payment=await response.json();
  if(!response.ok||payment.status!=="success"||!payment.data?.link)return NextResponse.json({error:payment.message||"Could not initialize payment."},{status:502});
  return NextResponse.json({order_id:order.data.id,reference,checkout_url:payment.data.link});
 }catch{return NextResponse.json({error:"Could not initialize payment."},{status:400})}
}
