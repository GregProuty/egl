import React from 'react'
import { addCommas, removeNonNumeric } from '../lib/helpers'
import Draggable from 'react-draggable'
import clsx from 'clsx'

interface DragLineProps {
    style?: object
    className?: string
    sliderPosition: any
    handleDrag?: Function
    currentGasLimit: string
    desiredLimit: string
    handleChangeLimit: Function
    handlePositionChange: Function
    handleLimitChanged: Function
    handleKeyPress: Function
}
export default function DragLine({
    style,
    className,
    sliderPosition,
    handleDrag,
    currentGasLimit,
    desiredLimit,
    handleChangeLimit,
    handlePositionChange,
    handleLimitChanged,
    handleKeyPress,
}: DragLineProps) {
    return (
        <Draggable
            axis='x'
            handle='.handle'
            position={sliderPosition}
            grid={[25, 25]}
            scale={1}
            bounds={{ left: -150, right: 150 }}
            onDrag={(e, data) => handleDrag(data)}
        >
            <div className={'flex flex-col justify-center items-center'}>
                <input
                    id={'slider'}
                    type={'text'}
                    min={
                        Number(currentGasLimit) - 3000000 // max variance
                    }
                    max={Number(currentGasLimit) + 3000000}
                    value={addCommas(removeNonNumeric(desiredLimit))}
                    style={{ width: '6em' }}
                    className={'slider text-center text-black'}
                    onChange={(e) => handleChangeLimit(e)}
                    onBlur={(e) => {
                        handlePositionChange(e.target.value)
                        handleLimitChanged(e.target.value)
                    }}
                    onKeyDown={(e) => handleKeyPress(e)}
                />
                <div
                    className={clsx(
                        'handle border border-black rounded-full',
                        'w-5 h-5 cursor-pointer bg-white'
                    )}
                ></div>
            </div>
        </Draggable>
    )
}
