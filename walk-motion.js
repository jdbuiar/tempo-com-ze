/* Gait is driven by traveled distance, not by an unrelated animation timer. */
const AquaWalkMotion={
  create(width,home,size){
    const speed=size*.75,stride=size*.74,start=-size*.8;
    const enter=(home-start)/speed*1000,cross=Math.max(0,width-home)/speed*1000;
    const marks={enter, sunny:enter+650, outward:enter+6450};
    marks.turn=marks.outward+cross;marks.back=marks.turn+900;marks.sunscreen=marks.back+cross;
    marks.face=marks.sunscreen+3000;marks.care=marks.face+650;marks.exit=marks.care+6300;
    marks.hidden=marks.exit+(home+size+20)/speed*1000;marks.end=180000;
    return {width,home,size,speed,stride,start,cross,marks};
  },
  frameForDistance(distance,stride){return Math.floor(Math.max(0,distance)/stride*10)%10},
  sample(time,path){
    const m=path.marks,t=((time%m.end)+m.end)%m.end;
    let x=path.home,atlas='care',frame=0,left=false,pose='resting',kind='sunny',distance=0;
    if(t<m.enter){distance=(t/1000)*path.speed;x=path.start+distance;atlas='walk';pose='entering'}
    else if(t<m.sunny){atlas='greeting';pose='turning'}
    else if(t<m.outward){atlas='greeting';frame=3;pose='greeting'}
    else if(t<m.turn){distance=(t-m.outward)/1000*path.speed;x=path.home+distance;atlas='walk';pose='walking-right'}
    else if(t<m.back){x=path.width;pose='turning-back';if(t-m.turn<450){atlas='greeting';frame=0}else{atlas='walk';frame=2;left=true}}
    else if(t<m.sunscreen){distance=(t-m.back)/1000*path.speed;x=path.width-distance;atlas='walk';left=true;pose='walking-back'}
    else if(t<m.face){const poses=[4,4,5,7,5,7,6,6,6,5,7,5];frame=poses[Math.floor((t-m.sunscreen)/580)%poses.length];pose='sunscreen'}
    else if(t<m.care){atlas='greeting';pose='turning-to-viewer';kind='care'}
    else if(t<m.exit){atlas='greeting';frame=3;pose='greeting';kind='care'}
    else if(t<m.hidden){distance=(t-m.exit)/1000*path.speed;x=path.home-distance;atlas='walk';left=true;pose='exiting';kind='care'}
    else{x=-path.size-20;atlas='walk';left=true;pose='waiting';kind='care'}
    if(atlas==='walk'&&pose!=='turning-back')frame=this.frameForDistance(distance,path.stride);
    const opacity=pose==='waiting'?0:t<500?t/500:1;
    return {x,atlas,frame,left,pose,kind,distance,opacity};
  }
};
if(typeof module!=='undefined'&&module.exports)module.exports=AquaWalkMotion;
