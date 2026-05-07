import { Alert, Flex } from 'antd';
import type { AudioSourceInfo } from '../types';

interface AudioSourcePanelProps {
  audio: AudioSourceInfo;
}

const AudioSourcePanel = ({ audio }: AudioSourcePanelProps) => (
  <section className="knowledge-document-page__audio-section">
    <Flex vertical gap={12}>
      <div className="knowledge-document-page__panel-title">音频源文件</div>
      {audio.url ? (
        <div className="knowledge-document-page__audio-player-wrap">
          <audio
            className="knowledge-document-page__audio-player"
            src={audio.url}
            controls
          >
            <track kind="captions" label="音频字幕" srcLang="zh-CN" />
          </audio>
        </div>
      ) : (
        <Alert
          type="info"
          showIcon
          message="暂无可直接播放的音频地址"
          description="当前文件仍可查看和管理已解析的切片内容。"
        />
      )}
    </Flex>
  </section>
);

export default AudioSourcePanel;
