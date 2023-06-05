import React, { useEffect, useRef, useState } from "react";
import Dayjs from "dayjs";
import classnames from "classnames";
import styles from "./view.module.scss";
import { getChannelFavicon } from "../../helpers/parseXML";
import * as dataAgent from "../../helpers/dataAgent";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { ToolbarItemNavigator } from "@/containers/Article/ToolBar";
import { Icon } from "../Icon";
import { Separator } from "@/components/ui/separator";
import { ReadingOptions } from "@/containers/Article/ReadingOptions";
import { fetch } from '@tauri-apps/api/http';
import { ArticleDetail } from "@/components/ArticleView/Detail";

type ArticleDialogViewProps = {
  article: any | null;
  userConfig: UserConfig;
  dialogStatus: boolean;
  trigger?: React.ReactNode;
  setDialogStatus: (status: boolean) => void;
  afterConfirm: () => void;
  afterCancel: () => void;
};

function createMarkup(html: string) {
  return { __html: html };
}

export const ArticleDialogView = (
  props: ArticleDialogViewProps
): JSX.Element => {
  const {
    article,
    userConfig,
    dialogStatus,
    setDialogStatus,
    afterConfirm,
    afterCancel,
    trigger,
  } = props;
  const viewRef = useRef<HTMLDivElement>(null);

  const renderPlaceholder = () => {
    return "Please Select Some read";
  };

  const handleDialogChange = (status: boolean) => {
    setDialogStatus(status);

    if (!status) {
      afterCancel();
    }
  };

  return (
    <Dialog open={ dialogStatus } onOpenChange={ handleDialogChange }>
      { trigger && <DialogTrigger>{ trigger }</DialogTrigger> }
      <DialogContent className="p-0 top-8 bottom-8 min-w-[860px] is-scroll">
        <div className="overflow-y-auto">
          <div className="sticky left-0 right-0 top-0 z-[3]">
            <div
              className="flex items-center justify-end px-20 py-2 space-x-0.5 rounded-tl-lg rounded-tr-lg  view-blur-bar">
              <ToolbarItemNavigator/>
              <span>
                <Separator orientation="vertical" className="h-4 mx-2"/>
              </span>
              <ReadingOptions/>
            </div>
            <span className="absolute right-2 top-[50%] mt-[-16px]">
              <Icon onClick={ () => handleDialogChange(false) }>
                <X size={ 16 }/>
              </Icon>
            </span>
          </div>
          <div className="relative px-20 py-10">
            { article ? <ArticleDetail article={ article }/> : renderPlaceholder() }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};