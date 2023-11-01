
function RenderImage(props){

   return( <img src={props.url || ""} alt={props.alt || "image"} style={{width:"100%",height:"100%"}}/>)
}

export default RenderImage;