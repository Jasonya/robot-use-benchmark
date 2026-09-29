"""Pixel-only colored-part perception for a deliberately simple workcell.

This is a deterministic computer-vision baseline, not a VLM. Its inputs contain
RGB and a public camera calibration. It never receives simulator object state.
"""
from __future__ import annotations
import numpy as np
from scipy import ndimage


def pixel_to_top_plane(pixel_xy, calibration):
    width=calibration["width"];height=calibration["height"]
    focal=height/(2*np.tan(np.deg2rad(calibration["fovy_degrees"])/2))
    px,py=map(float,pixel_xy)
    ray=np.array([(px-width/2)/focal,-(py-height/2)/focal,-1.])
    rotation=np.asarray(calibration["rotation_camera_to_world"],dtype=float)
    origin=np.asarray(calibration["position_world"],dtype=float)
    direction=rotation@ray
    distance=(calibration["visible_top_plane_z"]-origin[2])/direction[2]
    if distance<=0:raise ValueError("Camera ray misses the forward top plane")
    return origin+distance*direction


def detect_colored_parts(rgb: np.ndarray, calibration: dict) -> list[dict]:
    image=np.asarray(rgb,dtype=np.float32)/255.
    if image.shape!=(calibration["height"],calibration["width"],3):
        raise ValueError("RGB dimensions do not match calibration")
    r,g,b=image[:,:,0],image[:,:,1],image[:,:,2]
    masks={
        "magenta":(r>.36)&(b>.30)&(g<.66*np.minimum(r,b)),
        "green":(g>.35)&(g>1.6*r)&(g>1.4*b),
    }
    result=[]
    for color,mask in masks.items():
        labels,n=ndimage.label(mask)
        candidates=[]
        for index,window in enumerate(ndimage.find_objects(labels),1):
            if window is None:continue
            yy,xx=np.where(labels[window]==index)
            area=len(xx)
            if not 30<=area<=2400:continue
            px=float(xx.mean()+window[1].start)
            py=float(yy.mean()+window[0].start)
            world=pixel_to_top_plane([px,py],calibration)
            if not(-.32<world[0]<.32 and .48<world[1]<.96):continue
            candidates.append({
                "visual_identity":color,
                "pixel_centroid_xy":[px,py],
                "pixel_bbox_xyxy":[window[1].start,window[0].start,window[1].stop,window[0].stop],
                "estimated_center_xy":world[:2].tolist(),
                "mask_pixels":area,
                "estimation_source":"RGB color component centroid + public camera calibration",
            })
        if candidates:
            result.append(max(candidates,key=lambda d:d["mask_pixels"]))
    return result
