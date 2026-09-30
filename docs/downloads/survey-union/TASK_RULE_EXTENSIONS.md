# 任務與規則擴充：12個可追溯的規格例子

以下是作者規格，來源已有定義；尚未新增模擬測例或宣稱跨作新穎性。

| ID／操作 | 來源任務 | 擴充定義 | 計數層 |
|---|---|---|---|
| EX01／X01 | behavior::fold_towels | 摺疊符合尺寸規格，並放入對應收納區 | task_spec_variant |
| EX02／X02 | vima::constraint_satisfaction/sweep_without_touching | 為指定非目標物增加明確的整段位移上限 | rule_variant |
| EX03／X03 | arnold::open_drawer; arnold::close_drawer | 開抽屜、取得指定物件、最後關回；加入必要事件順序 | process_variant |
| EX04／X04 | arnold::transfer_water | 先取得容器餘量；容量足夠時一次轉移，不足時依規則分裝 | conditional_task_spec |
| EX05／X05 | behavior::packing_meal_for_delivery; behavior::delivering_groceries_to_doorstep | 按清單打包、保留載荷、送到指定交付點並完成確認 | composite_task_spec |
| EX06／X06 | vima::require_memory/manipulate_old_neighbor | 加入明訂參考時刻與物件身份，移動後仍按該時刻關係選取 | reference_variant |
| EX07／X07 | rlbench::straighten_rope | 加上兩端點區域與禁止跨越區；確認材料模型可支援後實作 | constraint_variant |
| EX08／X08 | behavior::delivering_groceries_to_doorstep | 加入接收方與可觀察接穩事件，之後才允許釋放 | role_variant |
| EX09／X09 | metaworld::assembly-v3 | 在記錄的中途偏離條件後完成裝配，並把使用工具放回指定狀態 | recovery_spec_or_intervention_case |
| EX10／X10 | vima::instruction_following/visual_manipulation | 查詢有效訂單版本，完成對應放置後登記；物理與數位結果需一致 | tool_process_variant |
| EX11／X11 | softgym::ClothFold | 分別提供固定相機、多視角或可主動觀察條件；保留足夠線索 | observation_or_instance_case |
| EX12／X12 | crosstask::59684 | 給定可用影片前綴／已完成步驟，判斷下一個合法程序步驟 | typed_information_spec |

每例的父來源URL、邏輯區分例和判分需求見extension_examples.json。其中EX11是觀測測例，EX12是資訊題；沒有把它們改報成新的物理任務家族。
