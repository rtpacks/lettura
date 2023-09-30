import React, { FC, useCallback, useEffect, useState } from "react";
import update from "immutability-helper";
import { TreeViewItem } from "./TreeViewItem";
import { FeedResItem } from "@/db";
import * as dataAgent from "@/helpers/dataAgent";
import { useBearStore } from "@/stores";
import { DragItem, DropItem } from "./ItemTypes";

interface TreeItem extends FeedResItem {
  isExpanded?: boolean;
}

const TreeView = () => {
  const store = useBearStore((state) => ({
    getFeedList: state.getFeedList,
    feedList: state.feedList,
    feed: state.feed,
  }));
  const [treeData, setTreeData] = useState<FeedResItem[]>([]);

  const requestUpdateOrder = (list: FeedResItem[]) => {
    const body = list.reduce(
      (acu, feed, idx) => {
        let item = {
          item_type: feed.item_type,
          uuid: feed.uuid,
          folder_uuid: feed.item_type === "folder" ? feed.uuid : "",
          sort: idx,
        };

        if (feed.children.length > 0) {
          feed.children.forEach((child) => {
            item.uuid = child.uuid || "";
            (item.folder_uuid = feed.uuid),
              acu.push({
                ...item,
              });
          });
        } else {
          acu.push({
            ...item,
          });
        }

        return acu;
      },
      [] as {
        item_type: string;
        uuid: string;
        folder_uuid: string;
        sort: number;
      }[]
    );

    console.log("%c Line:55 🥚 body", "color:#ffdd4d", body);

    dataAgent.updateFeedSort(body).then((res) => {
      console.log("%c Line:47 🥔 res", "color:#b03734", res);
    });
  };

  const hoverItem = useCallback(
    (
      [dragIndex, dragItem]: [dragIndex: number, dragItem: DragItem],
      [hoverIndex, dropResult]: [hoverIndex: number, dropResult: DropItem]
    ) => {
      setTreeData((prevCards: FeedResItem[]) =>
        update(prevCards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevCards[dragIndex] as FeedResItem],
          ],
        })
      );
    },
    [treeData]
  );

  const moveItem = (dragItemId: string, hoverItemId: string) => {
    const updatedTreeData = [...treeData];
    let dragItem: FeedResItem | undefined;
    let hoverItem: FeedResItem | undefined;

    const findItem = (items: FeedResItem[]) => {
      for (const item of items) {
        if (item.uuid === dragItemId) {
          dragItem = item;
        } else if (item.uuid === hoverItemId) {
          hoverItem = item;
        }

        if (dragItem && hoverItem) {
          break;
        }

        if (item.children) {
          findItem(item.children as DragItem[]);
        }
      }
    };

    findItem(updatedTreeData);

    console.log("%c Line:82 🍌 dragItem", "color:#33a5ff", dragItem);
    console.log("%c Line:84 🍢 hoverItem", "color:#ed9ec7", hoverItem);

    if (dragItem && hoverItem) {
      // if (dragItem.uuid === hoverItem.uuid) {
      //   return; // Ignore if the dragged item is already a child of the hover item
      // }

      // Remove dragItem from its original parent
      const removeItem = (items: FeedResItem[]) => {
        for (const item of items) {
          if (item.uuid === dragItem?.uuid && item.folder_uuid === dragItem?.folder_uuid) {
            item.folder_uuid = null;
            break;
          } else if (item.children) {
            removeItem(item.children);
          }
        }
      };

      console.log("%c Line:125 🥪 updatedTreeData", "color:#6ec1c2", updatedTreeData);

      removeItem(updatedTreeData);

      // Add dragItem as a child to the new parent
      const addChildToParent = (items: FeedResItem[]) => {
        for (const item of items) {
          if (item.uuid === hoverItem?.uuid) {
            if (!item.children) {
              item.children = [];
            }
            item.children.push(dragItem!);
            dragItem!.folder_uuid = item.uuid;
            break;
          } else if (item.children) {
            addChildToParent(item.children);
          }
        }
      };

      if (hoverItem.item_type === 'folder' && !hoverItem.children) {
        hoverItem.children = [];
      }

      addChildToParent(updatedTreeData);
    }

    setTreeData(updatedTreeData);

    console.log("%c Line:110 🍫 newTreeData", "color:#e41a6a", updatedTreeData);

    // requestUpdateOrder([...updatedTreeData]);
  };

  const toggleFolder = (folderId: string) => {
    console.log("%c Line:115 🍓 folderId", "color:#ed9ec7", folderId);
    const newTreeData = [...treeData];
    const folder = findItem(newTreeData, folderId);

    if (!folder || folder.item_type !== "folder") {
      return;
    }

    folder.isExpanded = !folder.isExpanded;

    setTreeData([...newTreeData]);
  };

  const findItem = (
    items: TreeItem[],
    itemId: string
  ): TreeItem | undefined => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.uuid === itemId) {
        return item;
      }

      if (item.children) {
        const nestedItem = findItem(item.children, itemId);

        if (nestedItem) {
          return nestedItem;
        }
      }
    }

    return undefined;
  };

  const findParent = (
    items: TreeItem[],
    itemId: string
  ): TreeItem | undefined => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (
        item.children &&
        item.children.some((child) => child.uuid === itemId)
      ) {
        return item;
      }

      if (item.children) {
        const nestedItem = findParent(item.children, itemId);

        if (nestedItem) {
          return nestedItem;
        }
      }
    }

    return undefined;
  };

  const renderTreeItems = (items: TreeItem[], level = 0): JSX.Element[] => {
    return items.map((item, idx) => {
      const isActive = store?.feed?.uuid === item.uuid;
      const parent_uuid = item.uuid;

      return (
        <TreeViewItem
          key={item.uuid}
          uuid={item.uuid}
          title={item.title}
          index={idx}
          level={level + 1}
          feed={item}
          folder_uuid={
            parent_uuid !== item.uuid && item.item_type === "channel"
              ? parent_uuid
              : null
          }
          isActive={isActive}
          isExpanded={item.isExpanded || false}
          moveItem={moveItem}
          onHover={hoverItem}
          toggleFolder={toggleFolder}
        >
          {item.children && renderTreeItems(item.children, level + 1)}
        </TreeViewItem>
      );
    });
  };

  useEffect(() => {
    setTreeData([...store.feedList]);
  }, [store.feedList]);

  return <div>{renderTreeItems(treeData)}</div>;
};

export default TreeView;